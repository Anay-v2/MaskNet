export interface DBUser {
    uid: string
    username: string
    pic: 't' | 's' | 'c'
    credits: number
    messages: {
        t: number
        c: number
    }[]
}