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
      // Tentar criar usuário no Auth
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        emailVerified: true,
        displayName: 'Administrador VERTOS'
      });
      uid = userRecord.uid;
      console.log('Usuário Auth criado com sucesso:', uid);
    } catch (e) {
      if (e.code === 'auth/email-already-exists') {
        const userRecord = await admin.auth().getUserByEmail(email);
        uid = userRecord.uid;
        console.log('Usuário Auth já existe, recuperando UID:', uid);
      } else {
        throw e;
      }
    }

    // 2. Criar/Atualizar perfil no Firestore com role admin
    await admin.firestore().collection('users').doc(uid).set({
      uid: uid,
      email: email,
      displayName: 'Administrador VERTOS',
      role: 'admin',
      plan: 'pro',
      status: 'active',
      atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`Perfil Firestore (admin) para ${email} atualizado com sucesso!`);
  } catch (error) {
    console.error('Erro ao processar admin:', error);
  }
};

const emails = [
  'cqgrupomatel@gmail.com',
  'mariliabedog@gmail.com',
  'lidianehoa@gmail.com'
];
const password = '123456';

const run = async () => {
  for (const email of emails) {
    await createAdmin(email, password);
  }
  console.log('--- Processo finalizado ---');
  process.exit(0);
};

run();
