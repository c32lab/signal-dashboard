export interface CodeQualityModule {
  name: string
  lines: number
  complexity: "low" | "medium" | "high"
  test_coverage: boolean
  issues: string[]
}

export interface CodeQualityMetrics {
  broad_except_count: number
  untested_collectors: number
  long_functions: number
  total_files: number
  total_lines: number
  test_files: number
}

export interface CodeQualityReport {
  overall_score: number
  target_score: number
  modules: CodeQualityModule[]
  metrics: CodeQualityMetrics
  history: { date: string; score: number }[]
}
