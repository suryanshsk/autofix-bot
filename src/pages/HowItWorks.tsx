import { GitBranch, Bot, TestTube, Code, CheckCircle, Users, Sparkles, Github, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20">
      {/* Hero Section */}
      <section className="container px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full border border-primary/30">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">AI-Powered Automation</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              How AutoFix Bot Works
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your intelligent CI/CD companion that automatically detects, analyzes, and fixes test failures in GitHub repositories
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="container px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Step 1 */}
          <Card className="overflow-hidden border-2 border-secondary hover:border-primary/50 transition-all hover:shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                    <Github className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-foreground">1. Connect Your Repository</h3>
                  </div>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Simply paste your GitHub repository URL into AutoFix Bot. Whether you own the repo or not, our system automatically handles permissions. If you don't have write access, we'll fork the repository for you and create a pull request back to the original.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1 bg-secondary/50 text-foreground text-sm rounded-full">Automatic Forking</span>
                    <span className="px-3 py-1 bg-secondary/50 text-foreground text-sm rounded-full">Permission Handling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="overflow-hidden border-2 border-secondary hover:border-primary/50 transition-all hover:shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                    <TestTube className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">2. Test Detection & Analysis</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Our AI scans your codebase to detect test frameworks (pytest, jest, vitest) and runs your test suite. It then analyzes the output using advanced pattern recognition and Google Gemini AI to identify every single error—syntax errors, import issues, assertion failures, and more.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1 bg-secondary/50 text-foreground text-sm rounded-full">Multi-Framework Support</span>
                    <span className="px-3 py-1 bg-secondary/50 text-foreground text-sm rounded-full">AI Classification</span>
                    <span className="px-3 py-1 bg-secondary/50 text-foreground text-sm rounded-full">3-Layer Parsing</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="overflow-hidden border-2 border-secondary hover:border-primary/50 transition-all hover:shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">3. Intelligent Auto-Fixing</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    For each detected error, our AI generates precise fixes by understanding the context, dependencies, and codebase structure. Missing dependencies? We install them automatically. Import errors? Fixed. Syntax issues? Corrected. The agent applies fixes iteratively until tests pass.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1 bg-secondary/50 text-foreground text-sm rounded-full">Context-Aware Fixes</span>
                    <span className="px-3 py-1 bg-secondary/50 text-foreground text-sm rounded-full">Auto-Dependencies</span>
                    <span className="px-3 py-1 bg-secondary/50 text-foreground text-sm rounded-full">Smart Iterations</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card className="overflow-hidden border-2 border-secondary hover:border-primary/50 transition-all hover:shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                    <Code className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">4. Code Changes & Verification</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Every fix is tracked and verified. After applying changes, the agent re-runs tests to ensure they pass. You get a detailed before/after code comparison showing exactly what was changed, why it was changed, and the impact on your test suite.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1 bg-secondary/50 text-foreground text-sm rounded-full">Before/After Diffs</span>
                    <span className="px-3 py-1 bg-secondary/50 text-foreground text-sm rounded-full">Test Verification</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 5 */}
          <Card className="overflow-hidden border-2 border-secondary hover:border-primary/50 transition-all hover:shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                    <GitBranch className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">5. Pull Request Creation</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Once all fixes are applied and tests pass, AutoFix Bot automatically creates a new branch with a clear naming convention (autofix-YYYYMMDD-HHMMSS) and opens a pull request with detailed descriptions of all changes made. You can review, approve, and merge with confidence.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1 bg-secondary/50 text-foreground text-sm rounded-full">Auto Branch</span>
                    <span className="px-3 py-1 bg-secondary/50 text-foreground text-sm rounded-full">Detailed PR</span>
                    <span className="px-3 py-1 bg-secondary/50 text-foreground text-sm rounded-full">Review Ready</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Highlights */}
      <section className="container px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Key Features
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 border-secondary hover:border-primary/50 transition-all hover:shadow-lg">
              <CardContent className="p-6 space-y-3">
                <Zap className="h-10 w-10 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Fixes most issues in under 2 iterations with smart progress tracking
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-secondary hover:border-primary/50 transition-all hover:shadow-lg">
              <CardContent className="p-6 space-y-3">
                <Bot className="h-10 w-10 text-primary" />
                <h3 className="text-lg font-bold text-foreground">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">
                  Uses Google Gemini 2.0 Flash for accurate error classification
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-secondary hover:border-primary/50 transition-all hover:shadow-lg">
              <CardContent className="p-6 space-y-3">
                <CheckCircle className="h-10 w-10 text-primary" />
                <h3 className="text-lg font-bold text-foreground">High Success Rate</h3>
                <p className="text-sm text-muted-foreground">
                  3-layer error parsing ensures no error goes unnoticed
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-white via-secondary/30 to-accent/30 shadow-2xl shadow-primary/20">
            <CardContent className="p-8 sm:p-12">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Meet the Team
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  AutoFix Bot is proudly built by a talented team of developers passionate about making CI/CD workflows smarter and more efficient.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <div className="px-6 py-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border-2 border-primary/30 hover:border-primary transition-all hover:scale-105 hover:shadow-lg">
                    <p className="text-2xl font-bold text-primary">Shreya</p>
                    <p className="text-sm text-muted-foreground">Developer</p>
                  </div>
                  <div className="px-6 py-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border-2 border-primary/30 hover:border-primary transition-all hover:scale-105 hover:shadow-lg">
                    <p className="text-2xl font-bold text-primary">Sneha</p>
                    <p className="text-sm text-muted-foreground">Developer</p>
                  </div>
                  <div className="px-6 py-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border-2 border-primary/30 hover:border-primary transition-all hover:scale-105 hover:shadow-lg">
                    <p className="text-2xl font-bold text-primary">Saloni</p>
                    <p className="text-sm text-muted-foreground">Developer</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
