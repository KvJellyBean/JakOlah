"""
Comprehensive Logging System for Jakarta Waste Classification ML Service
Handles classification logging, error tracking, and performance monitoring.
"""

import logging
import logging.handlers
import json
import os
import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from pathlib import Path
import uuid

class MLServiceLogger:
    """
    Comprehensive logging system for ML service operations.
    Handles classification attempts, errors, and performance metrics.
    """
    
    def __init__(self, 
                 log_dir: str = None,
                 service_name: str = "jakarta-waste-ml",
                 enable_console: bool = True,
                 enable_file: bool = True,
                 log_level: str = "INFO"):
        """
        Initialize ML service logger.
        
        Args:
            log_dir: Directory for log files
            service_name: Name of the service for log identification
            enable_console: Whether to enable console logging
            enable_file: Whether to enable file logging
            log_level: Logging level (DEBUG, INFO, WARNING, ERROR)
        """
        self.log_dir = log_dir or self._get_default_log_dir()
        self.service_name = service_name
        self.enable_console = enable_console
        self.enable_file = enable_file
        self.log_level = getattr(logging, log_level.upper())
        
        # Create log directory if it doesn't exist
        os.makedirs(self.log_dir, exist_ok=True)
        
        # Initialize loggers
        self._setup_loggers()
        
    def _get_default_log_dir(self) -> str:
        """Get default log directory path."""
        # Get path to logs directory relative to ml-service
        current_dir = Path(__file__).parent.parent.parent.parent  # ml-service/src/utils -> project root
        log_dir = current_dir / "logs"
        return str(log_dir)
    
    def _setup_loggers(self):
        """Setup different types of loggers."""
        # Main service logger
        self.main_logger = self._create_logger(
            'ml_service', 
            'ml_service.log', 
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Classification-specific logger
        self.classification_logger = self._create_logger(
            'classification', 
            'classifications.log', 
            '%(asctime)s - %(message)s'
        )
        
        # Error-specific logger
        self.error_logger = self._create_logger(
            'errors', 
            'errors.log', 
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        )
    
    def _create_logger(self, name: str, filename: str, format_str: str) -> logging.Logger:
        """Create and configure a logger."""
        logger = logging.getLogger(f"{self.service_name}.{name}")
        logger.setLevel(self.log_level)
        
        # Remove existing handlers to avoid duplication
        for handler in logger.handlers[:]:
            logger.removeHandler(handler)
        
        # Create formatter
        formatter = logging.Formatter(format_str)
        
        # Console handler
        if self.enable_console:
            console_handler = logging.StreamHandler()
            console_handler.setLevel(self.log_level)
            console_handler.setFormatter(formatter)
            logger.addHandler(console_handler)
        
        # File handler with rotation
        if self.enable_file:
            log_file_path = os.path.join(self.log_dir, filename)
            file_handler = logging.handlers.RotatingFileHandler(
                log_file_path,
                maxBytes=10*1024*1024,  # 10MB
                backupCount=5
            )
            file_handler.setLevel(self.log_level)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)
        
        return logger
    
    def log_classification_attempt(self, 
                                 request_id: str,
                                 image_metadata: Dict[str, Any],
                                 processing_times: Dict[str, float],
                                 classification_result: Dict[str, Any],
                                 success: bool = True,
                                 error_message: Optional[str] = None):
        """
        Log a classification attempt with all relevant details.
        
        Args:
            request_id: Unique request identifier
            image_metadata: Image information (size, format, etc.)
            processing_times: Time taken for each processing step
            classification_result: Classification results
            success: Whether classification was successful
            error_message: Error message if classification failed
        """
        log_entry = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'request_id': request_id,
            'type': 'classification_attempt',
            'success': success,
            'image_metadata': image_metadata,
            'processing_times': processing_times,
            'total_time': sum(processing_times.values()) if processing_times else 0,
            'classification_result': classification_result if success else None,
            'error_message': error_message
        }
        
        # Log as JSON for easy parsing
        self.classification_logger.info(json.dumps(log_entry))
        
        # Also log summary to main logger
        if success:
            self.main_logger.info(f"Classification successful - ID: {request_id}, "
                                f"Result: {classification_result.get('prediction', 'unknown')}, "
                                f"Confidence: {classification_result.get('confidence', 0):.3f}, "
                                f"Time: {sum(processing_times.values()):.3f}s")
        else:
            self.main_logger.error(f"Classification failed - ID: {request_id}, "
                                 f"Error: {error_message}")
    
    def log_performance_metrics(self, 
                              operation: str,
                              duration: float,
                              metadata: Optional[Dict[str, Any]] = None):
        """
        Log performance metrics for various operations.
        
        Args:
            operation: Name of the operation (e.g., 'preprocessing', 'feature_extraction')
            duration: Time taken in seconds
            metadata: Additional metadata about the operation
        """
        log_entry = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': 'performance_metric',
            'operation': operation,
            'duration_seconds': duration,
            'metadata': metadata or {}
        }
        
        self.main_logger.info(f"Performance - {operation}: {duration:.3f}s")
        self.classification_logger.info(json.dumps(log_entry))
    
    def log_model_info(self, model_info: Dict[str, Any]):
        """
        Log information about loaded models.
        
        Args:
            model_info: Dictionary containing model information
        """
        log_entry = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': 'model_info',
            'models': model_info
        }
        
        self.main_logger.info(f"Models loaded: {list(model_info.keys())}")
        self.classification_logger.info(json.dumps(log_entry))
    
    def log_error(self, 
                  operation: str,
                  error: Exception,
                  context: Optional[Dict[str, Any]] = None,
                  request_id: Optional[str] = None):
        """
        Log an error with full context information.
        
        Args:
            operation: Operation where error occurred
            error: The exception that occurred
            context: Additional context information
            request_id: Associated request ID if available
        """
        log_entry = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': 'error',
            'operation': operation,
            'error_type': type(error).__name__,
            'error_message': str(error),
            'request_id': request_id,
            'context': context or {}
        }
        
        self.error_logger.error(json.dumps(log_entry))
        self.main_logger.error(f"Error in {operation}: {str(error)}")
    
    def log_api_request(self, 
                       method: str,
                       endpoint: str,
                       request_id: str,
                       client_ip: Optional[str] = None,
                       user_agent: Optional[str] = None):
        """
        Log API request information.
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint
            request_id: Unique request identifier
            client_ip: Client IP address
            user_agent: User agent string
        """
        log_entry = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': 'api_request',
            'method': method,
            'endpoint': endpoint,
            'request_id': request_id,
            'client_ip': client_ip,
            'user_agent': user_agent
        }
        
        self.main_logger.info(f"API Request - {method} {endpoint} - ID: {request_id}")
        self.classification_logger.info(json.dumps(log_entry))
    
    def log_startup_info(self, config: Dict[str, Any]):
        """
        Log service startup information.
        
        Args:
            config: Service configuration
        """
        log_entry = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': 'startup',
            'service': self.service_name,
            'config': config
        }
        
        self.main_logger.info(f"Service {self.service_name} started")
        self.classification_logger.info(json.dumps(log_entry))
    
    def create_request_id(self) -> str:
        """
        Create a unique request ID for tracking.
        
        Returns:
            Unique request identifier
        """
        return str(uuid.uuid4())

# Global logger instance
_ml_logger = None

def get_logger(log_dir: Optional[str] = None,
               service_name: str = "jakarta-waste-ml",
               enable_console: bool = True,
               enable_file: bool = True,
               log_level: str = "INFO") -> MLServiceLogger:
    """
    Get global ML service logger instance (singleton pattern).
    
    Args:
        log_dir: Directory for log files
        service_name: Name of the service
        enable_console: Whether to enable console logging
        enable_file: Whether to enable file logging
        log_level: Logging level
        
    Returns:
        MLServiceLogger instance
    """
    global _ml_logger
    if _ml_logger is None:
        _ml_logger = MLServiceLogger(log_dir, service_name, enable_console, enable_file, log_level)
    return _ml_logger

def log_classification(request_id: str,
                      image_metadata: Dict[str, Any],
                      processing_times: Dict[str, float],
                      classification_result: Dict[str, Any],
                      success: bool = True,
                      error_message: Optional[str] = None):
    """
    Convenience function for logging classification attempts.
    
    Args:
        request_id: Unique request identifier
        image_metadata: Image information
        processing_times: Processing time breakdown
        classification_result: Classification results
        success: Whether classification was successful
        error_message: Error message if failed
    """
    logger = get_logger()
    logger.log_classification_attempt(
        request_id, image_metadata, processing_times, 
        classification_result, success, error_message
    )

def log_performance(operation: str, duration: float, metadata: Optional[Dict[str, Any]] = None):
    """
    Convenience function for logging performance metrics.
    
    Args:
        operation: Name of the operation
        duration: Time taken in seconds
        metadata: Additional metadata
    """
    logger = get_logger()
    logger.log_performance_metrics(operation, duration, metadata)

def log_error(operation: str, 
              error: Exception, 
              context: Optional[Dict[str, Any]] = None,
              request_id: Optional[str] = None):
    """
    Convenience function for logging errors.
    
    Args:
        operation: Operation where error occurred
        error: The exception
        context: Additional context
        request_id: Associated request ID
    """
    logger = get_logger()
    logger.log_error(operation, error, context, request_id)

def create_request_id() -> str:
    """
    Convenience function for creating request IDs.
    
    Returns:
        Unique request identifier
    """
    logger = get_logger()
    return logger.create_request_id()

# Context manager for timing operations
class LoggedOperation:
    """Context manager for automatically logging operation duration."""
    
    def __init__(self, operation_name: str, metadata: Optional[Dict[str, Any]] = None):
        self.operation_name = operation_name
        self.metadata = metadata or {}
        self.start_time = None
    
    def __enter__(self):
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = time.time() - self.start_time
        
        if exc_type is None:
            # Operation successful
            log_performance(self.operation_name, duration, self.metadata)
        else:
            # Operation failed
            log_error(self.operation_name, exc_val, self.metadata)
            log_performance(f"{self.operation_name}_failed", duration, self.metadata)
        
        return False  # Don't suppress exceptions