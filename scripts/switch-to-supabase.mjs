#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🔄 BASCULEMENT VERS SUPABASE...\n');

// Fichiers à modifier
const filesToUpdate = [
  {
    path: 'server/db.ts',
    backup: 'server/db-neon.ts.backup',
    replace: 'server/db-supabase.ts'
  },
  {
    path: 'server/storage.ts',
    backup: 'server/storage-drizzle.ts.backup',
    replace: 'server/storage-supabase.ts'
  }
];

// Fonction pour sauvegarder et remplacer
function switchFile(fileConfig) {
  const originalPath = path.join(rootDir, fileConfig.path);
  const backupPath = path.join(rootDir, fileConfig.backup);
  const replacePath = path.join(rootDir, fileConfig.replace);

  try {
    // Vérifier si le fichier de remplacement existe
    if (!fs.existsSync(replacePath)) {
      console.log(`❌ Fichier de remplacement manquant : ${fileConfig.replace}`);
      return false;
    }

    // Créer une sauvegarde si elle n'existe pas déjà
    if (!fs.existsSync(backupPath)) {
      console.log(`📋 Sauvegarde : ${fileConfig.path} → ${fileConfig.backup}`);
      fs.copyFileSync(originalPath, backupPath);
    }

    // Remplacer le fichier
    console.log(`✅ Remplacement : ${fileConfig.replace} → ${fileConfig.path}`);
    fs.copyFileSync(replacePath, originalPath);
    
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${fileConfig.path} :`, error.message);
    return false;
  }
}

// Exécuter les modifications
console.log('📁 Modification des fichiers...\n');

let success = true;
for (const fileConfig of filesToUpdate) {
  if (!switchFile(fileConfig)) {
    success = false;
  }
}

console.log('\n─'.repeat(50));

if (success) {
  console.log('\n✅ BASCULEMENT RÉUSSI !\n');
  console.log('📝 PROCHAINES ÉTAPES :');
  console.log('1. Vérifiez que SUPABASE_SERVICE_ROLE_KEY est dans .env');
  console.log('2. Redémarrez le serveur backend');
  console.log('3. Testez les fonctionnalités\n');
  
  console.log('🔙 Pour revenir à Neon, exécutez :');
  console.log('   node scripts/switch-to-neon.mjs\n');
} else {
  console.log('\n❌ BASCULEMENT ÉCHOUÉ !');
  console.log('Vérifiez les erreurs ci-dessus.\n');
}

// Créer le script de retour
const revertScript = `#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🔄 RETOUR VERS NEON DB...\n');

const filesToRestore = ${JSON.stringify(filesToUpdate.map(f => ({
  backup: f.backup,
  target: f.path
})), null, 2)};

for (const file of filesToRestore) {
  const backupPath = path.join(rootDir, file.backup);
  const targetPath = path.join(rootDir, file.target);
  
  if (fs.existsSync(backupPath)) {
    console.log(\`✅ Restauration : \${file.backup} → \${file.target}\`);
    fs.copyFileSync(backupPath, targetPath);
  } else {
    console.log(\`❌ Backup manquant : \${file.backup}\`);
  }
}

console.log('\\n✅ Retour à Neon DB effectué !');
`;

fs.writeFileSync(path.join(rootDir, 'scripts/switch-to-neon.mjs'), revertScript);
console.log('📝 Script de retour créé : scripts/switch-to-neon.mjs');