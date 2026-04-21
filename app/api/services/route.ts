import { readFileSync } from "fs"
import { join } from "path"
import type { Service } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  const filePath = join(process.cwd(), "data", "services.json")
  const services: Service[] = JSON.parse(readFileSync(filePath, "utf-8"))
  return Response.json(services)
}
