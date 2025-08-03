import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3, 
  Brain, 
  Building2, 
  Package, 
  Users, 
  TrendingUp,
  Sparkles,
  Shield,
  Zap,
  Globe
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Enterprise OS
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm hover:text-primary">
              Tarifs
            </Link>
            <Link href="/features" className="text-sm hover:text-primary">
              Fonctionnalités
            </Link>
            <Link href="/about" className="text-sm hover:text-primary">
              À propos
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="sm">
                Connexion
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">
                Essai gratuit
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold tracking-tight">
            La plateforme tout-en-un pour
            <span className="text-primary"> gérer votre entreprise</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Optimisez vos opérations avec l'intelligence artificielle. 
            Finance, CRM, RH, Supply Chain - tout ce dont vous avez besoin en une seule plateforme.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Commencer gratuitement
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                Voir la démo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Essai gratuit de 30 jours • Aucune carte bancaire requise
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Une solution complète avec IA intégrée
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Finance</CardTitle>
                <CardDescription>
                  Gestion financière complète avec prédictions IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Devis et factures intelligents</li>
                  <li>✓ Analyse des risques contractuels</li>
                  <li>✓ Optimisation des prix avec IA</li>
                  <li>✓ Analytics prédictives</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>CRM</CardTitle>
                <CardDescription>
                  Relation client augmentée par l'IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Lead scoring automatique</li>
                  <li>✓ Prédiction du churn</li>
                  <li>✓ Recommandations personnalisées</li>
                  <li>✓ Chatbot intelligent</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Package className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Supply Chain</CardTitle>
                <CardDescription>
                  Optimisation logistique intelligente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Prédiction des stocks</li>
                  <li>✓ Optimisation des routes</li>
                  <li>✓ Scoring fournisseurs</li>
                  <li>✓ Tracking en temps réel</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Building2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>RH</CardTitle>
                <CardDescription>
                  Gestion RH automatisée et prédictive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Matching CV/Poste par IA</li>
                  <li>✓ Prédiction du turnover</li>
                  <li>✓ Recommandations formation</li>
                  <li>✓ Analyse du bien-être</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Insights temps réel et prédictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Tableaux de bord personnalisés</li>
                  <li>✓ Prédictions financières</li>
                  <li>✓ Détection d'anomalies</li>
                  <li>✓ Rapports automatisés</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="h-10 w-10 text-primary mb-2" />
                <CardTitle>IA Centrale</CardTitle>
                <CardDescription>
                  Intelligence artificielle intégrée partout
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ 45+ services IA spécialisés</li>
                  <li>✓ Automatisation intelligente</li>
                  <li>✓ Apprentissage continu</li>
                  <li>✓ Personnalisation avancée</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Pourquoi choisir Enterprise OS ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Performance</h3>
              <p className="text-sm text-muted-foreground">
                Temps de réponse < 200ms grâce à l'architecture optimisée
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Sécurité</h3>
              <p className="text-sm text-muted-foreground">
                Chiffrement de bout en bout et conformité RGPD
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Scalabilité</h3>
              <p className="text-sm text-muted-foreground">
                De la startup à la multinationale, nous grandissons avec vous
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Innovation</h3>
              <p className="text-sm text-muted-foreground">
                IA de pointe et mises à jour continues
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Prêt à transformer votre entreprise ?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Rejoignez plus de 10,000 entreprises qui ont déjà choisi Enterprise OS 
            pour optimiser leurs opérations avec l'intelligence artificielle.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Démarrer l'essai gratuit
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 Enterprise OS. Tous droits réservés.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="hover:text-primary">
                Confidentialité
              </Link>
              <Link href="/terms" className="hover:text-primary">
                Conditions
              </Link>
              <Link href="/contact" className="hover:text-primary">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}