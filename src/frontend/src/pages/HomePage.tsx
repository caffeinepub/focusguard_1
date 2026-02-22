import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Camera, Music, Shield, TrendingUp, ArrowRight } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container py-16 md:py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-balance">
                Stay Focused with
                <span className="block text-primary mt-2">FocusGuard</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground text-balance">
                Stay Present. Stay Disciplined. Stay Ahead.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                onClick={() => navigate({ to: '/timer' })}
                className="gap-2 text-lg px-8 py-6 rounded-xl shadow-soft-xl hover:shadow-soft-2xl transition-all duration-200 hover:scale-105"
              >
                Start Focus Session
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: '/dashboard' })}
                className="gap-2 text-lg px-8 py-6 rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-200"
              >
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative background image */}
        <div className="absolute inset-0 -z-10 opacity-5">
          <img
            src="/assets/generated/hero-study.dim_1200x600.png"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Stay Focused
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful tools designed to help you maintain concentration and build better study habits
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Camera className="h-8 w-8" />}
              iconImage="/assets/generated/icon-camera-active.dim_48x48.png"
              title="Camera Monitoring"
              description="AI-powered presence detection keeps you accountable during study sessions"
              delay={0}
            />
            <FeatureCard
              icon={<Music className="h-8 w-8" />}
              title="Focus Music"
              description="Curated playlists and ambient sounds to enhance concentration"
              delay={100}
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Distraction Blocking"
              description="Stay on track by blocking distracting websites during sessions"
              delay={200}
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              iconImage="/assets/generated/icon-streak.dim_64x64.png"
              title="Study Analytics"
              description="Track progress, build streaks, and visualize your productivity"
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-t from-primary/5 to-background">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center space-y-8 rounded-2xl border bg-card p-8 md:p-12 shadow-soft-xl">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Transform Your Study Habits?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join students who are achieving their goals with focused, distraction-free study sessions
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => navigate({ to: '/timer' })}
              className="gap-2 text-lg px-8 py-6 rounded-xl shadow-soft-xl hover:shadow-soft-2xl transition-all duration-200 hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
