"""
Test script for ML Service
Run this to verify the service is working correctly
"""
import requests
import json
from pathlib import Path


def test_health_endpoint():
    """Test health check endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get("http://localhost:8000/health")
        data = response.json()
        
        print(f"✓ Status: {response.status_code}")
        print(f"✓ Service: {data.get('service')}")
        print(f"✓ ML Models: {data.get('components', {}).get('ml_models')}")
        print()
        
        return response.status_code == 200
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return False


def test_classify_endpoint(image_path: str):
    """Test classify endpoint with image"""
    print(f"Testing classify endpoint with {image_path}...")
    
    if not Path(image_path).exists():
        print(f"✗ Image not found: {image_path}")
        print("Please provide a test image path")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post(
                "http://localhost:8000/api/classify-frame",
                files=files
            )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Status: {response.status_code}")
            print(f"✓ Success: {data.get('success')}")
            
            detections = data.get('data', {}).get('detections', [])
            metadata = data.get('data', {}).get('metadata', {})
            
            print(f"✓ Detections: {len(detections)}")
            print(f"✓ Processing time: {metadata.get('processing_time_ms')}ms")
            
            if detections:
                print("\nDetected objects:")
                for i, det in enumerate(detections):
                    print(f"  {i+1}. {det['category']} ({det['confidence']:.2%})")
                    print(f"     BBox: ({det['bbox']['x']}, {det['bbox']['y']}, "
                          f"{det['bbox']['width']}, {det['bbox']['height']})")
            else:
                print("  No objects detected")
            
            print()
            return True
        else:
            print(f"✗ Status: {response.status_code}")
            print(f"✗ Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Classification failed: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("JakOlah ML Service Test Suite")
    print("=" * 60)
    print()
    
    # Test 1: Health check
    health_ok = test_health_endpoint()
    
    if not health_ok:
        print("⚠️  Service not running. Start it with:")
        print("   python -m uvicorn app.main:app --reload")
        return
    
    # Test 2: Classification (optional - user provides image)
    print("To test classification, run:")
    print("  python test_service.py <path-to-test-image>")
    print()
    print("Example:")
    print("  python test_service.py ../test_image.jpg")
    print()
    
    # If image path provided via command line
    import sys
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        test_classify_endpoint(image_path)
    
    print("=" * 60)
    print("Testing complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
