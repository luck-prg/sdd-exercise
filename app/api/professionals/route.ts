import { readFileSync } from "fs"
import { join } from "path"
import type { Professional } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  const filePath = join(process.cwd(), "data", "professionals.json")
  const professionals: Professional[] = JSON.parse(readFileSync(filePath, "utf-8"))
  return Response.json(professionals)
}
