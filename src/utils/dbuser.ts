
import { type Database, ref as dbref, get, onValue, type DatabaseReference } from '@firebase/database'
import type { DBUser } from './types'
import { ref, type Ref } from 'vue'
import { onAuthStateChanged, type Auth } from '@firebase/auth'

export async function useDBUser(auth: Auth, db: Database) {

    let dbuser: Ref<DBUser | undefined> = ref(auth.currentUser ? (await fetchUser(db, auth.currentUser?.uid || '')) : undefined)
    onAuthStateChanged(auth, async () => {
        dbuser = ref(auth.currentUser ? (await fetchUser(db, auth.currentUser?.uid || '')) : undefined)
        onValue(
            dbref(db, `users/${auth.currentUser?.uid}`),
            (snap) => {
                dbuser = snap.val()
            }
        )
    })
    if(auth.currentUser) {
        onValue(
            dbref(db, `users/${auth.currentUser?.uid}`),
            (snap) => {
                dbuser = snap.val()
            }
)
    }

    return dbuser
}

export async function fetchUser(db: Database, uid: string) {
	return (await get(dbref(db, `users/${uid}`))).val() as DBUser
}

export function useReactiveDBRef(db: Database, path: DatabaseReference) {
    const r = ref(undefined) as Ref<any>

    onValue(path, (snap) => {
        r.value = snap.val()
    })

    return r
}