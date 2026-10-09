import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { DEFAULT_CMS_CONTENT } from '../data/defaultCms';
import { createInlineContentRevision } from './inlineTextKey';

export async function saveInlineContent(key, value, previous) {
  if (!auth.currentUser) throw new Error('Du må være logget inn som administrator.');
  const config = doc(db, 'cms_configs', 'default');
  const revision = doc(collection(db, 'cms_revisions'));
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(config);
    const changes = createInlineContentRevision(snapshot.data() || {}, DEFAULT_CMS_CONTENT, key, value, previous);
    transaction.set(config, changes.after, { merge: true });
    transaction.set(revision, {
      ...changes,
      createdAt: serverTimestamp(), author: auth.currentUser.email || auth.currentUser.uid,
      authorUid: auth.currentUser.uid,
    });
  });
}
