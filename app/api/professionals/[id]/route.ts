import { readFileSync } from "fs"
import { join } from "path"
import type { Professional } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const filePath = join(process.cwd(), "data", "professionals.json")
  const professionals: Professional[] = JSON.parse(readFileSync(filePath, "utf-8"))
  const professional = professionals.find((p) => p.id === id)

  if (!professional) {
    return Response.json({ error: "Professional not found" }, { status: 404 })
  }

  return Response.json(professional)
}
