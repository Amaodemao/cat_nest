import 'dotenv/config'

// Keep schema synchronization away from the development database.
process.env.DATABASE_URL = 'file::memory:'
