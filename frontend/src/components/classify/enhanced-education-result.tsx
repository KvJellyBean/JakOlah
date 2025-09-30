/**
 * Enhanced Education Result Component
 *
 * Integrates education content with classification results
 * for contextual learning experience
 */

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EducationContent } from "@/components/info/education-content";
import {
  ClassificationResult,
  type ClassificationCategory,
} from "@/components/classify/classification-result";
import {
  generateEducationContent,
  generateConfidenceRecommendation,
  type ClassificationResult as ClassificationData,
} from "@/lib/education-generator";
import {
  BookOpen,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";

interface EnhancedEducationResultProps {
  results?: ClassificationCategory[];
  loading?: boolean;
  error?: string;
  showFullEducation?: boolean;
  className?: string;
}

export function EnhancedEducationResult({
  results = [],
  loading = false,
  error,
  showFullEducation = false,
  className = "",
}: EnhancedEducationResultProps) {
  // Get dominant category and generate education content
  const dominantCategory = results.reduce((prev, current) =>
    prev.percentage > current.percentage ? prev : current
  );

  // Map UI results to education generator format
  const educationData: ClassificationData | null = dominantCategory
    ? {
        categoryCode: mapCategoryToCode(dominantCategory.name),
        confidence: dominantCategory.percentage,
        allConfidences: {
          organik: results.find(r => r.name === "Organik")?.percentage || 0,
          anorganik: results.find(r => r.name === "Anorganik")?.percentage || 0,
          lainnya: results.find(r => r.name === "Lainnya")?.percentage || 0,
        },
      }
    : null;

  const educationContent = educationData
    ? generateEducationContent(educationData)
    : null;
  const confidenceRecommendation = educationData
    ? generateConfidenceRecommendation(educationData.allConfidences)
    : null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Classification Results */}
      <ClassificationResult
        results={results}
        loading={loading}
        {...(error && { error })}
      />

      {/* Enhanced Education Content */}
      {educationContent && !loading && !error && (
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="border-b border-gray-100 bg-emerald-50">
            <CardTitle className="text-lg text-emerald-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Panduan Pengelolaan Lengkap</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Confidence Recommendation */}
              {confidenceRecommendation && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Rekomendasi Berdasarkan Tingkat Kepercayaan
                      </h4>
                      <p className="text-blue-800 text-sm">
                        {confidenceRecommendation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Disposal Guidance */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />
                    Cara Pengelolaan
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {educationContent.disposal_guidance}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-4 h-4 text-emerald-500 mr-2" />
                    Fasilitas yang Tepat
                  </h4>
                  <ul className="space-y-2">
                    {educationContent.local_facilities.map(
                      (facility, index) => (
                        <li
                          key={index}
                          className="flex items-center text-sm text-gray-700"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
                          {facility}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              {/* Tips Section */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
                  Tips Praktis
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {educationContent.tips.map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 bg-emerald-50 p-3 rounded-lg border border-emerald-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <p className="text-emerald-800 text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environmental Impact */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-lg border border-emerald-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 text-emerald-600 mr-2" />
                  Dampak Lingkungan
                </h4>
                <p className="text-gray-800 text-sm leading-relaxed">
                  {educationContent.environmental_impact}
                </p>
              </div>

              {/* Confidence Warning */}
              {educationContent.confidence_note && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-2">
                        Perhatian
                      </h4>
                      <p className="text-yellow-800 text-sm">
                        {educationContent.confidence_note}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Educational System */}
      {showFullEducation && !loading && !error && (
        <EducationContent
          category={educationData ? educationData.categoryCode : "ALL"}
          className="mt-8"
        />
      )}
    </div>
  );
}

/**
 * Helper function to map UI category names to education codes
 */
function mapCategoryToCode(categoryName: string): "ORG" | "ANO" | "LAI" {
  switch (categoryName.toLowerCase()) {
    case "organik":
      return "ORG";
    case "anorganik":
      return "ANO";
    case "lainnya":
      return "LAI";
    default:
      return "ORG"; // default fallback
  }
}
