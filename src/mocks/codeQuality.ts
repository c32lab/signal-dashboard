// TODO: Replace with fetch from /api/code-quality or static JSON

import type { CodeQualityReport } from '../types/codeQuality'

export const mockCodeQuality: CodeQualityReport = {
  overall_score: 7.1,
  target_score: 7.5,
  modules: [
    {
      name: "ai_judge.py",
      lines: 900,
      complexity: "high",
      test_coverage: false,
      issues: ["6 个 >50 行函数", "broad except"]
    },
    {
      name: "signal_scanner.py",
      lines: 650,
      complexity: "medium",
      test_coverage: true,
      issues: ["3 个 >50 行函数"]
    },
    {
      name: "combiner.py",
      lines: 420,
      complexity: "medium",
      test_coverage: true,
      issues: []
    },
    {
      name: "collectors/binance.py",
      lines: 380,
      complexity: "low",
      test_coverage: false,
      issues: ["broad except", "无重试机制"]
    },
    {
      name: "api_server.py",
      lines: 310,
      complexity: "low",
      test_coverage: false,
      issues: ["broad except"]
    }
  ],
  metrics: {
    broad_except_count: 47,
    untested_collectors: 5,
    long_functions: 6,
    total_files: 42,
    total_lines: 8500,
    test_files: 12
  },
  history: [
    { date: "2026-03-01", score: 5.8 },
    { date: "2026-03-02", score: 6.2 },
    { date: "2026-03-03", score: 6.6 },
    { date: "2026-03-04", score: 6.6 },
    { date: "2026-03-05", score: 7.1 }
  ]
}
