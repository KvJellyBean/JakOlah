/**
 * Classification Session Hook
 * T052: Session management for classifications
 * Tracks classification history, statistics, and session info
 */

import { useState, useCallback, useEffect } from "react";

export function useClassificationSession() {
  const [session, setSession] = useState({
    sessionId: null,
    startTime: null,
    totalClassifications: 0,
    successfulClassifications: 0,
    failedClassifications: 0,
    history: [],
    stats: {
      Organik: 0,
      Anorganik: 0,
      Lainnya: 0,
    },
  });

  // Initialize session on mount
  useEffect(() => {
    setSession(prev => ({
      ...prev,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date().toISOString(),
    }));
  }, []);

  /**
   * Add classification result to session
   */
  const addClassification = useCallback(result => {
    setSession(prev => {
      const isSuccess = result.detections && result.detections.length > 0;

      // Update category stats
      const newStats = { ...prev.stats };
      if (isSuccess) {
        result.detections.forEach(detection => {
          if (newStats[detection.category] !== undefined) {
            newStats[detection.category]++;
          }
        });
      }

      // Add to history (keep last 50)
      const newHistory = [
        {
          timestamp: new Date().toISOString(),
          detections: result.detections || [],
          metadata: result.metadata || {},
          success: isSuccess,
        },
        ...prev.history,
      ].slice(0, 50);

      return {
        ...prev,
        totalClassifications: prev.totalClassifications + 1,
        successfulClassifications:
          prev.successfulClassifications + (isSuccess ? 1 : 0),
        failedClassifications: prev.failedClassifications + (isSuccess ? 0 : 1),
        history: newHistory,
        stats: newStats,
      };
    });
  }, []);

  /**
   * Reset session
   */
  const resetSession = useCallback(() => {
    setSession({
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date().toISOString(),
      totalClassifications: 0,
      successfulClassifications: 0,
      failedClassifications: 0,
      history: [],
      stats: {
        Organik: 0,
        Anorganik: 0,
        Lainnya: 0,
      },
    });
  }, []);

  /**
   * Get session summary
   */
  const getSessionSummary = useCallback(() => {
    const duration = session.startTime
      ? Date.now() - new Date(session.startTime).getTime()
      : 0;

    return {
      sessionId: session.sessionId,
      duration: Math.floor(duration / 1000), // seconds
      totalClassifications: session.totalClassifications,
      successRate:
        session.totalClassifications > 0
          ? (
              (session.successfulClassifications /
                session.totalClassifications) *
              100
            ).toFixed(1)
          : 0,
      categoryBreakdown: session.stats,
      recentDetections: session.history.slice(0, 10),
    };
  }, [session]);

  /**
   * Export session data for download/sharing
   */
  const exportSession = useCallback(() => {
    return {
      ...getSessionSummary(),
      fullHistory: session.history,
      exportedAt: new Date().toISOString(),
    };
  }, [session, getSessionSummary]);

  return {
    session,
    addClassification,
    resetSession,
    getSessionSummary,
    exportSession,
  };
}
