import { SignUpForm } from '@/features/auth/components/SignUpForm'
import Link from 'next/link'

export default function SignUpPage() {
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
              Commencez votre essai gratuit de 30 jours
            </p>
          </div>
          
          <SignUpForm />
        </div>
      </div>

      {/* Right side - Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 to-primary/5 items-center justify-center">
        <div className="max-w-md space-y-8 p-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Tout ce dont vous avez besoin</h2>
            <p className="text-lg text-muted-foreground">
              Une plateforme complète pour gérer et faire croître votre entreprise
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Gestion financière complète</h3>
                <p className="text-sm text-muted-foreground">
                  Devis, factures, analytics avec IA intégrée
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">CRM intelligent</h3>
                <p className="text-sm text-muted-foreground">
                  Scoring automatique des leads et prédictions
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Supply Chain optimisée</h3>
                <p className="text-sm text-muted-foreground">
                  Gestion des stocks et livraisons avec IA
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">RH automatisé</h3>
                <p className="text-sm text-muted-foreground">
                  Recrutement, paie et formations intelligentes
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Rejoint par plus de <span className="font-bold text-primary">10,000</span> entreprises
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}