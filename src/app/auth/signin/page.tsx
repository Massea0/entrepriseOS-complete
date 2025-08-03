import { SignInForm } from '@/features/auth/components/SignInForm'
import Link from 'next/link'
import Image from 'next/image'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-bold text-primary">Enterprise OS</h1>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              La plateforme tout-en-un pour gérer votre entreprise
            </p>
          </div>
          
          <SignInForm />
        </div>
      </div>

      {/* Right side - Image/Graphics */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 to-primary/5 items-center justify-center">
        <div className="max-w-md text-center space-y-6 p-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Bienvenue</h2>
            <p className="text-lg text-muted-foreground">
              Connectez-vous pour accéder à tous vos outils de gestion d'entreprise
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-background/50 backdrop-blur p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Sécurisé</div>
            </div>
            <div className="bg-background/50 backdrop-blur p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
            <div className="bg-background/50 backdrop-blur p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">IA</div>
              <div className="text-sm text-muted-foreground">Intégrée</div>
            </div>
            <div className="bg-background/50 backdrop-blur p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">7</div>
              <div className="text-sm text-muted-foreground">Modules</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}