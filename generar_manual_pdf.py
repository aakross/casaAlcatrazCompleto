import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas

# ==============================================================================
# CLASE DE NUMERACIÓN DE PÁGINAS (CANVAS AVANZADO)
# ==============================================================================
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#555555"))

        # No dibujar en la portada (página 1)
        if self._pageNumber > 1:
            # Header
            self.drawString(
                54,
                11 * 72 - 36,
                "CASA ALCATRAZ  |  Manual de Operación: Control de Rentas Comerciales",
            )
            self.setStrokeColor(colors.HexColor("#D1D5DB"))
            self.setLineWidth(0.5)
            self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)

            # Footer
            footer_text = f"Página {self._pageNumber} de {page_count}"
            self.drawRightString(8.5 * 72 - 54, 34, footer_text)
            self.drawString(
                54,
                34,
                "Documento Confidencial - Guía para Personal de Captura y Administración",
            )
            self.line(54, 46, 8.5 * 72 - 54, 46)

        self.restoreState()


# ==============================================================================
# GENERADOR DEL MANUAL
# ==============================================================================
def generar_manual(pdf_path):
    os.makedirs(os.path.dirname(os.path.abspath(pdf_path)), exist_ok=True)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Colores institucionales
    c_primary = colors.HexColor("#1E3A8A")     # Azul marino institucional
    c_secondary = colors.HexColor("#B45309")   # Ámbar / Dorado
    c_text = colors.HexColor("#1F2937")        # Gris oscuro texto
    c_bg_light = colors.HexColor("#F8FAFC")    # Fondo suave
    c_border = colors.HexColor("#E2E8F0")

    # Estilos de párrafo
    title_cover = ParagraphStyle(
        "CoverTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=28,
        textColor=c_primary,
        alignment=1,
    )

    subtitle_cover = ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#4B5563"),
        alignment=1,
    )

    h1 = ParagraphStyle(
        "Heading1_Custom",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=c_primary,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    )

    h2 = ParagraphStyle(
        "Heading2_Custom",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=14,
        textColor=c_secondary,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True,
    )

    body = ParagraphStyle(
        "Body_Custom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=c_text,
        spaceAfter=4,
    )

    body_bold = ParagraphStyle(
        "BodyBold_Custom",
        parent=body,
        fontName="Helvetica-Bold",
    )

    bullet_style = ParagraphStyle(
        "Bullet_Custom",
        parent=body,
        leftIndent=14,
        firstLineIndent=-9,
        spaceAfter=3,
    )

    callout_box = ParagraphStyle(
        "Callout_Text",
        parent=body,
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#1E3A8A"),
    )

    story = []

    # ==========================================================================
    # PORTADA
    # ==========================================================================
    story.append(Spacer(1, 20))
    story.append(Paragraph("CASA ALCATRAZ", ParagraphStyle("Brand", fontName="Helvetica-Bold", fontSize=13, alignment=1, textColor=c_secondary)))
    story.append(Spacer(1, 10))
    story.append(Paragraph("MANUAL DE USUARIO Y OPERACIÓN", title_cover))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Módulo de Control de Rentas, Casetas Comerciales y Auditoría de Pagos", subtitle_cover))
    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="80%", thickness=1.5, color=c_primary, spaceBefore=4, spaceAfter=18))

    meta_data = [
        [Paragraph("<b>Objetivo del Manual:</b>", body), Paragraph("Guía visual y paso a paso para personal de captura, cobranza y supervisión administrativa.", body)],
        [Paragraph("<b>Enfoque:</b>", body), Paragraph("100% No técnico, práctico y orientado a tareas diarias de captura y consulta de información.", body)],
        [Paragraph("<b>Versión del Módulo:</b>", body), Paragraph("1.0.0 (Producción)", body)],
        [Paragraph("<b>Sistema:</b>", body), Paragraph("Casa Alcatraz - Módulo de Rentas", body)],
    ]
    t_meta = Table(meta_data, colWidths=[120, 370])
    t_meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), c_bg_light),
        ("BOX", (0, 0), (-1, -1), 1, c_border),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, c_border),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t_meta)

    story.append(Spacer(1, 15))

    intro_p = Paragraph(
        "<b>¡Bienvenido!</b> Este manual está diseñado para ayudarte a capturar pagos, consultar adeudos y registrar información de locales de forma fácil, segura y sin confusiones. Cada proceso se explica paso a paso para que cualquier persona del equipo pueda operarlo desde el primer día.",
        callout_box
    )
    t_intro = Table([[intro_p]], colWidths=[490])
    t_intro.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EFF6FF")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#93C5FD")),
        ("PADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(t_intro)

    story.append(Spacer(1, 10))

    # ==========================================================================
    # SECCIÓN 1: CONCEPTOS BÁSICOS
    # ==========================================================================
    story.append(Paragraph("1. Conceptos Básicos que Debes Conocer", h1))
    story.append(Paragraph(
        "Para que la captura y consulta sea muy sencilla, el sistema utiliza algunos términos específicos explicados con ejemplos de la vida real:",
        body
    ))

    glosario = [
        [Paragraph("<b>Término</b>", body_bold), Paragraph("<b>¿Qué significa en el día a día?</b>", body_bold)],
        [
            Paragraph("<b>Región</b>", body),
            Paragraph("La zona geográfica amplia donde están ubicados los locales (por ejemplo: <i>'Zona Centro'</i>, <i>'Costa'</i>, <i>'Valle'</i>).", body)
        ],
        [
            Paragraph("<b>Complejo / Lugar</b>", body),
            Paragraph("El edificio, plaza, nave o terreno específico dentro de una región (por ejemplo: <i>'Plaza Esmeralda'</i> o <i>'Nave Industrial 3'</i>).", body)
        ],
        [
            Paragraph("<b>Local y Nickname</b>", body),
            Paragraph("Cada caseta tiene dos identificadores: su <b>Número Físico</b> (ej. <i>'Local 104'</i>) y su <b>Nickname o Nombre Comercial</b> (ej. <i>'Frutería Don Pepe'</i>).", body)
        ],
        [
            Paragraph("<b>Día de Corte</b>", body),
            Paragraph("El día del mes pactado en el contrato en el cual el inquilino debe pagar su renta (por ejemplo, el día <b>5</b> de cada mes).", body)
        ],
        [
            Paragraph("<b>Fecha de Abono Real<br/>(Banco) *</b>", body),
            Paragraph("<b>¡Muy importante!</b> El día exacto en que el dinero cayó a la cuenta del banco o se entregó el efectivo. Es la fecha base de los reportes contables.", body)
        ],
        [
            Paragraph("<b>Fecha de Captura<br/>(Sistema)</b>", body),
            Paragraph("El día y la hora exactos en que tú te sentaste en la computadora a registrar el pago. El sistema la guarda de forma automática.", body)
        ],
        [
            Paragraph("<b>Baja Lógica</b>", body),
            Paragraph("En este sistema <b>nada se borra por completo</b>. Si desactivas un pago o local, solo se oculta para no romper el historial de reportes.", body)
        ],
        [
            Paragraph("<b>Bitácora Antifraude</b>", body),
            Paragraph("Si corriges un pago, el sistema guarda quién lo cambió, qué tenía antes, qué tiene ahora y te pide <b>obligatoriamente un motivo</b>.", body)
        ],
    ]
    t_glosario = Table(glosario, colWidths=[120, 370])
    t_glosario.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ("GRID", (0, 0), (-1, -1), 0.5, c_border),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t_glosario)

    story.append(PageBreak())

    # ==========================================================================
    # SECCIÓN 2: CÓMO INGRESAR
    # ==========================================================================
    story.append(Paragraph("2. Cómo Entrar al Módulo de Rentas", h1))
    story.append(Paragraph(
        "1. Inicia sesión en el sistema Casa Alcatraz con tu usuario y contraseña.<br/>"
        "2. En el menú lateral izquierdo (Sidebar), haz clic en <b>'Control de Rentas'</b> (ícono de edificio).<br/>"
        "3. En la parte superior encontrarás cuatro pestañas: <b>Dashboard</b>, <b>Control de Adeudos</b>, <b>Gestión de Pagos</b> y <b>Locales y Contratos</b>.",
        body
    ))

    # ==========================================================================
    # SECCIÓN 3: CÓMO CAPTURAR UN PAGO
    # ==========================================================================
    story.append(Paragraph("3. Cómo Registrar un Pago de Renta (Paso a Paso)", h1))
    story.append(Paragraph(
        "Puedes abrir la ventana de captura de dos maneras:<br/>"
        "• <b>Opción A (La más rápida):</b> En la pestaña <b>'Control de Adeudos'</b>, busca al inquilino y haz clic en el botón azul <b>'Abonar'</b> de su fila.<br/>"
        "• <b>Opción B (Directa):</b> Haz clic en el botón verde superior <b>'+ Registrar Pago'</b>.",
        body
    ))

    pasos_pago = [
        [Paragraph("<b>Campo en Pantalla</b>", body_bold), Paragraph("<b>¿Qué debes escribir o seleccionar?</b>", body_bold), Paragraph("<b>Ejemplo</b>", body_bold)],
        [
            Paragraph("<b>Contrato / Local</b>", body),
            Paragraph("Elige en la lista desplegable el local e inquilino al que pertenece el pago.", body),
            Paragraph("<i>Local 104 - Frutería Don Pepe</i>", body)
        ],
        [
            Paragraph("<b>Monto Pagado ($)</b>", body),
            Paragraph("Escribe la cantidad exacta de dinero pagada en pesos.", body),
            Paragraph("<b>$5,500.00</b>", body)
        ],
        [
            Paragraph("<b>Meses Cubiertos</b>", body),
            Paragraph("Cuántos meses de renta cubre este abono (1, 2 o 0.5 si es fracción).", body),
            Paragraph("<b>1</b> mes", body)
        ],
        [
            Paragraph("<b>Fecha Abono Real<br/>(Banco) *</b>", body),
            Paragraph("<b>¡ATENCIÓN!</b> Fecha del comprobante bancario. No pongas la fecha de hoy a menos que hayan depositado hoy.", body),
            Paragraph("<i>05/10/2026</i>", body)
        ],
        [
            Paragraph("<b>Método de Pago</b>", body),
            Paragraph("Elige: <i>Efectivo</i>, <i>Transferencia</i>, <i>Depósito</i> o <i>Cheque</i>.", body),
            Paragraph("<i>Transferencia</i>", body)
        ],
        [
            Paragraph("<b>Referencia Bancaria</b>", body),
            Paragraph("Número de rastreo, autorización o folio de ticket (recomendado).", body),
            Paragraph("<i>SPEI-948201</i>", body)
        ],
        [
            Paragraph("<b>Notas</b>", body),
            Paragraph("Cualquier detalle aclaratorio opcional.", body),
            Paragraph("<i>'Pagó en ventanilla'</i>", body)
        ],
    ]
    t_pasos_pago = Table(pasos_pago, colWidths=[120, 260, 110])
    t_pasos_pago.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ("GRID", (0, 0), (-1, -1), 0.5, c_border),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t_pasos_pago)

    story.append(Spacer(1, 6))
    alerta_pago = Paragraph(
        "<b>REGLA DE ORO DE CAPTURA:</b> Llena con exactitud la <b>Fecha de Abono Real</b>. De esa fecha dependen los reportes de ingresos de gerencia y dirección.",
        ParagraphStyle("Alert", parent=body, fontName="Helvetica-Bold", textColor=colors.HexColor("#991B1B"))
    )
    t_alerta = Table([[alerta_pago]], colWidths=[490])
    t_alerta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFF1F2")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#FECDD3")),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t_alerta)

    # ==========================================================================
    # SECCIÓN 4: CONTROL DE ADEUDOS
    # ==========================================================================
    story.append(Paragraph("4. Cómo Entender la Pantalla de 'Control de Adeudos'", h1))
    story.append(Paragraph(
        "El sistema calcula el estatus en tiempo real de forma matemática:<br/>"
        "1. <b>Meses Cobrables:</b> Meses transcurridos desde el inicio del contrato hasta hoy según el día de corte.<br/>"
        "2. <b>Meses Pagados:</b> Suma total de mensualidades pagadas.<br/>"
        "3. <b>Meses Pendientes:</b> Meses Cobrables menos Meses Pagados.<br/>"
        "4. <b>Saldo Deuda:</b> Meses pendientes multiplicados por la renta mensual en pesos.",
        body
    ))

    semaforo_data = [
        [
            Paragraph("<font color='#047857'><b>● AL CORRIENTE (Verde)</b></font>", body_bold),
            Paragraph("El inquilino ha cubierto todas sus mensualidades. Su saldo de deuda es $0.00.", body)
        ],
        [
            Paragraph("<font color='#B91C1C'><b>● CON ADEUDO (Rojo)</b></font>", body_bold),
            Paragraph("El inquilino tiene mensualidades vencidas. La columna 'Saldo Deuda' muestra el monto pendiente.", body)
        ],
    ]
    t_sem = Table(semaforo_data, colWidths=[150, 340])
    t_sem.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, c_border),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#ECFDF5")),
        ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#FFF1F2")),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(t_sem)

    story.append(PageBreak())

    # ==========================================================================
    # SECCIÓN 5: AUDITORÍA Y CORRECCIÓN DE ERRORES
    # ==========================================================================
    story.append(Paragraph("5. Corrección de Errores y Seguridad (Auditoría Antifraude)", h1))
    story.append(Paragraph(
        "Si alguna vez te equivocas al capturar un pago, así es como debes corregirlo:",
        body
    ))

    story.append(Paragraph("A. ¿Cómo modificar un pago ya capturado?", h2))
    story.append(Paragraph(
        "1. Ve a la pestaña <b>'Gestión de Pagos e Historial'</b>.<br/>"
        "2. Haz clic en el ícono del <b>Lápiz (Editar)</b> en la columna de Acciones del pago.<br/>"
        "3. Corrige el monto o la fecha según corresponda.<br/>"
        "4. <b>Paso Obligatorio:</b> En el recuadro amarillo escribe el <b>Motivo del Cambio</b> (ej. <i>'Error de dedo: eran $5,000 en vez de $500'</i>).<br/>"
        "5. Haz clic en <b>'Guardar Modificación'</b>.",
        body
    ))

    story.append(Paragraph("B. ¿Cómo ver el historial de cambios de un pago?", h2))
    story.append(Paragraph(
        "Al presionar el botón del <b>Reloj (Ver Historial)</b> se abrirá una ventana con toda la historia:<br/>"
        "• Valor anterior vs Valor nuevo (monto, fecha y meses).<br/>"
        "• Usuario que realizó la modificación.<br/>"
        "• Fecha y hora exactas del cambio.<br/>"
        "• Motivo registrado obligatoriamente.",
        body
    ))

    story.append(Paragraph("C. ¿Qué hacer si un pago rebotó o fue cancelado? (Baja Lógica)", h2))
    story.append(Paragraph(
        "Haz clic en el ícono del <b>Bote de Basura (Baja Lógica)</b>. Escribe el motivo (ej. <i>'Cheque devuelto por falta de fondos'</i>). El pago quedará desactivado de las sumas pero registrado en la bitácora para auditorías.",
        body
    ))

    # ==========================================================================
    # SECCIÓN 6: REGISTRO DE LOCALES Y CONTRATOS
    # ==========================================================================
    story.append(Paragraph("6. Cómo Registrar Locales, Contratos y Crear 'Al Vuelo'", h1))
    story.append(Paragraph(
        "En la pestaña <b>'Locales y Contratos'</b> administras los inmuebles y sus contratos:",
        body
    ))

    story.append(Paragraph("Creación 'Al Vuelo' (Nunca te quedas trabado):", h2))
    story.append(Paragraph(
        "• <b>+ Región al Vuelo:</b> Registra una nueva zona geográfica (ej. <i>'Zona Industrial'</i>) al instante.<br/>"
        "• <b>+ Complejo al Vuelo:</b> Registra una plaza, nave o complejo dentro de una región en segundos.",
        body
    ))

    story.append(Paragraph("Cómo dar de alta un Local Comercial:", h2))
    story.append(Paragraph(
        "1. Haz clic en <b>'+ Nuevo Local'</b>.<br/>"
        "2. Elige el complejo, escribe el <b>Número Físico</b> (ej. <i>'Caseta 12'</i>) y el <b>Nickname</b> (ej. <i>'Taquería El Pastor'</i>).<br/>"
        "3. Guarda el registro. El local aparecerá como <b>'Disponible'</b> en verde.",
        body
    ))

    story.append(Paragraph("Cómo activar un Contrato de Arrendamiento:", h2))
    story.append(Paragraph(
        "1. Haz clic en <b>'+ Nuevo Contrato'</b>.<br/>"
        "2. Selecciona el local, escribe el nombre del inquilino y su teléfono.<br/>"
        "3. Coloca la <b>Fecha de Inicio</b>, el <b>Monto de Renta Mensual</b> y el <b>Día de Corte</b>.<br/>"
        "4. Al guardar, el local cambia automáticamente a <b>'Rentado'</b> y se activa en el control de adeudos.",
        body
    ))

    story.append(PageBreak())

    # ==========================================================================
    # SECCIÓN 7: DASHBOARD Y CONSULTA DIRECTIVA
    # ==========================================================================
    story.append(Paragraph("7. Cómo Leer el Dashboard de Métricas", h1))
    story.append(Paragraph(
        "La pestaña <b>'Dashboard & Indicadores'</b> es la vista para gerencia y dirección:",
        body
    ))

    dash_grid = [
        [Paragraph("<b>Indicador en Pantalla</b>", body_bold), Paragraph("<b>¿Cómo interpretarlo?</b>", body_bold)],
        [
            Paragraph("<b>Tasa de Ocupación (%)</b>", body),
            Paragraph("Porcentaje de locales generando ingresos contra los desocupados (ej. 8 de 10 = <b>80%</b>).", body)
        ],
        [
            Paragraph("<b>Ingreso Mes Actual (Banco)</b>", body),
            Paragraph("Total de dinero real ingresado a banco en el mes en curso (según <b>Fecha de Abono Real</b>).", body)
        ],
        [
            Paragraph("<b>Cartera Vencida (Deuda)</b>", body),
            Paragraph("Monto total en pesos que deben los inquilinos morosos a la fecha actual.", body)
        ],
        [
            Paragraph("<b>Contratos Al Corriente</b>", body),
            Paragraph("Total de inquilinos que van al día sin ningún saldo pendiente.", body)
        ],
        [
            Paragraph("<b>Histórico de Recaudación</b>", body),
            Paragraph("Gráfica interactiva de 12 meses que muestra la cobranza real mes con mes.", body)
        ],
    ]
    t_dash = Table(dash_grid, colWidths=[150, 340])
    t_dash.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ("GRID", (0, 0), (-1, -1), 0.5, c_border),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(t_dash)

    story.append(Spacer(1, 10))

    # ==========================================================================
    # SECCIÓN 8: PREGUNTAS FRECUENTES
    # ==========================================================================
    story.append(Paragraph("8. Preguntas Frecuentes (FAQ)", h1))

    faqs = [
        ("¿Qué pasa si un inquilino paga 3 meses juntos por adelantado?",
         "En el formulario pones el total pagado (ej. $15,000) y en 'Meses Cubiertos' escribes <b>3</b>. El sistema lo reconoce y no generará adeudo en los siguientes 3 meses."),
        ("¿Por qué un inquilino sale en rojo con adeudo si apenas es día 2 del mes?",
         "Revisa el <b>Día de Corte</b> de su contrato. Si su corte es el día 1, al llegar el día 2 el sistema ya considera vencida la mensualidad."),
        ("¿Puedo borrar un local si ya no existe físicamente?",
         "Sí, con la baja lógica. El local se oculta para nuevos contratos pero su historial contable se conserva intacto."),
        ("¿Se puede consultar o capturar desde un teléfono o tableta?",
         "Sí. El sistema tiene diseño adaptable (responsive) y funciona en celulares, tabletas y computadoras."),
    ]

    for p, r in faqs:
        story.append(Paragraph(f"<b>P: {p}</b>", body_bold))
        story.append(Paragraph(f"R: {r}", body))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=4, spaceAfter=10))
    story.append(Paragraph("<i>Manual elaborado para el sistema administrativo Casa Alcatraz. Todos los derechos reservados.</i>", ParagraphStyle("Fin", fontName="Helvetica-Oblique", fontSize=8, alignment=1, textColor=colors.HexColor("#9CA3AF"))))

    # Construir documento
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Manual generado con éxito en: {pdf_path}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        ruta_salida = sys.argv[1]
    else:
        ruta_salida = os.path.join(os.getcwd(), "Manual_Usuario_Sistema_Rentas.pdf")
    generar_manual(ruta_salida)
