import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  QuotationDocument,
  type QuotationPdfProps,
} from "./quotation-document";

export async function renderQuotationPdf(
  props: QuotationPdfProps
): Promise<Buffer> {
  return renderToBuffer(QuotationDocument(props));
}
