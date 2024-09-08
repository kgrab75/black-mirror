import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSONFilePreset } from 'lowdb/node'
import { View } from '@/app/lib/definitions'

type Data = {
  views: View[]
}

const defaultData: Data = {
  views: [{
    "name": "Météo",
    "id": 1,
    "current": true,
    "modules": []
  }]
}
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = process.env.NODE_ENV === 'production'
  ? join('/app/data/db-prod.json')
  : join(__dirname, '../../../data/db.json')

export const db = await JSONFilePreset<Data>(file, defaultData);