import * as XLSX from "xlsx";
import { type FilaReporteFinanciero } from "../../domain/reportes.repository";
import { ReporteExcelDto } from "../dtos/reporte-excel.dto";

export class ExcelExportService {
  static exportarAuditoria(filas: FilaReporteFinanciero[]): void {
    // 1. Transformar los datos planos a columnas amigables mediante el DTO
    const datosMapeados = ReporteExcelDto.toExcelRows(filas);

    // 2. Crear un libro de trabajo (Workbook) y una hoja (Worksheet)
    const hoja = XLSX.utils.json_to_sheet(datosMapeados);
    const libro = XLSX.utils.book_new();

    // 3. Ajustar el ancho automático de las columnas para que no se corte el texto
    const anchos = Object.keys(datosMapeados[0] || {}).map((clave) => ({
      wch: Math.max(clave.length + 4, 15),
    }));
    hoja["!cols"] = anchos;

    // 4. Acoplar la hoja al libro e iniciar la descarga inmediata en el navegador
    XLSX.utils.book_append_sheet(libro, hoja, "Auditoría Financiera");

    const fechaHoy = new Date().toISOString().split("T")[0];
    XLSX.writeFile(libro, `Reporte_Financiero_Alcatraz_${fechaHoy}.xlsx`);
  }
}
