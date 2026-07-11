import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: quotation, error: quotationError } = await supabase
    .from("quotations")
    .select("pdf_path")
    .eq("id", id)
    .single();

  if (quotationError || !quotation?.pdf_path) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }

  const { data: file, error: downloadError } = await supabase.storage
    .from("quotation-pdfs")
    .download(quotation.pdf_path);

  if (downloadError || !file) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }

  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="quotation-${id}.pdf"`,
    },
  });
}
