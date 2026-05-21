import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

const serviceAccount = JSON.parse(
  await readFile(new URL('../serviceAccountKey.json', import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const createAdmin = async (email, password) => {
  try {
    let uid;
    try {
      // 1. Tentar criar usuário no Auth
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        emailVerified: true,
        displayName: 'Administrador VERTOS'
      });
      uid = userRecord.uid;
      console.log('Usuário Auth criado com sucesso:', uid);
    } catch (e) {
      if (e.code === 'auth/email-exists' || e.code === 'auth/email-already-exists') {
        const userRecord = await admin.auth().getUserByEmail(email);
        uid = userRecord.uid;
        console.log('Usuário Auth já existe, recuperando UID:', uid);
        
        // Atualizar a senha para a informada
        await admin.auth().updateUser(uid, {
          password: password,
          displayName: 'Administrador VERTOS'
        });
        console.log('Senha atualizada com sucesso para o usuário existente.');
      } else {
        throw e;
      }
    }

    const payload = {
      uid: uid,
      email: email,
      displayName: 'Administrador VERTOS',
      role: 'admin',
      plan: 'pro',
      plano: 'pro',
      status: 'active',
      onboardingCompleto: true,
      atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
    };

    // 2. Criar/Atualizar perfil no Firestore na coleção 'users'
    await admin.firestore().collection('users').doc(uid).set(payload, { merge: true });
    console.log(`Perfil Firestore na coleção 'users' para ${email} criado/atualizado com sucesso!`);

    // 3. Criar/Atualizar perfil no Firestore na coleção 'usuarios' (se houver essa coleção)
    await admin.firestore().collection('usuarios').doc(uid).set(payload, { merge: true });
    console.log(`Perfil Firestore na coleção 'usuarios' para ${email} criado/atualizado com sucesso!`);

    console.log(`\n🎉 Usuário administrador ${email} pronto e com acesso total e permanente garantido!`);
  } catch (error) {
    console.error('Erro ao processar admin:', error);
  }
};

const run = async () => {
  const email = 'mvdiogomayer@gmail.com';
  const password = '12345678';
  await createAdmin(email, password);
  console.log('--- Processo finalizado ---');
  process.exit(0);
};

run();
