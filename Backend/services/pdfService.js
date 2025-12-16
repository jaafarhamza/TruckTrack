import PDFDocument from "pdfkit";

export const generateTripPDF = (trip) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // Header
  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("MISSION ORDER", { align: "center" })
    .moveDown(0.5);

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Trip Number: ${trip.tripNumber}`, { align: "center" })
    .moveDown(1.5);

  // Status Banner
  const statusColors = {
    PLANNED: "#3b82f6",
    IN_PROGRESS: "#f59e0b",
    COMPLETED: "#22c55e",
    CANCELLED: "#ef4444",
  };
  doc
    .fontSize(10)
    .fillColor(statusColors[trip.status] || "#666")
    .text(`Status: ${trip.status.replace("_", " ")}`, { align: "center" })
    .fillColor("#000")
    .moveDown(1.5);

  // Horizontal line
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown(1);

  // Driver Information Section
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("DRIVER INFORMATION")
    .moveDown(0.5);

  doc
    .fontSize(11)
    .font("Helvetica")
    .text(
      `Name: ${trip.driver?.firstName || ""} ${trip.driver?.lastName || ""}`
    )
    .text(`Email: ${trip.driver?.email || "N/A"}`)
    .text(`Phone: ${trip.driver?.phone || "N/A"}`)
    .moveDown(1);

  // Vehicle Information Section
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("VEHICLE INFORMATION")
    .moveDown(0.5);

  doc
    .fontSize(11)
    .font("Helvetica")
    .text(
      `Truck: ${trip.truck?.plateNumber || "N/A"} (${trip.truck?.brand || ""} ${
        trip.truck?.model || ""
      })`
    )
    .text(
      `Trailer: ${
        trip.trailer
          ? `${trip.trailer.plateNumber} (${trip.trailer.type})`
          : "N/A"
      }`
    )
    .moveDown(1);

  // Route Information Section
  doc.fontSize(14).font("Helvetica-Bold").text("ROUTE DETAILS").moveDown(0.5);

  // Origin
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("Origin:")
    .font("Helvetica")
    .text(
      `  City: ${trip.origin?.city || "N/A"}, ${trip.origin?.country || ""}`
    )
    .text(`  Address: ${trip.origin?.street || "N/A"}`)
    .text(`  Postal Code: ${trip.origin?.postalCode || "N/A"}`)
    .moveDown(0.5);

  // Destination
  doc
    .font("Helvetica-Bold")
    .text("Destination:")
    .font("Helvetica")
    .text(
      `  City: ${trip.destination?.city || "N/A"}, ${
        trip.destination?.country || ""
      }`
    )
    .text(`  Address: ${trip.destination?.street || "N/A"}`)
    .text(`  Postal Code: ${trip.destination?.postalCode || "N/A"}`)
    .moveDown(1);

  // Schedule Section
  doc.fontSize(14).font("Helvetica-Bold").text("SCHEDULE").moveDown(0.5);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  doc
    .fontSize(11)
    .font("Helvetica")
    .text(`Departure: ${formatDate(trip.departureDate)}`)
    .text(`Expected Arrival: ${formatDate(trip.arrivalDate)}`)
    .moveDown(1);

  // Mileage Section (if trip has started)
  if (trip.startKm != null) {
    doc.fontSize(14).font("Helvetica-Bold").text("MILEAGE").moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Start Km: ${trip.startKm?.toLocaleString() || "N/A"} km`);

    if (trip.endKm != null) {
      doc
        .text(`End Km: ${trip.endKm.toLocaleString()} km`)
        .text(
          `Distance Traveled: ${(
            trip.endKm - trip.startKm
          ).toLocaleString()} km`
        );
    }
    doc.moveDown(1);
  }

  // Cargo Section
  if (trip.cargo || trip.weight) {
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("CARGO INFORMATION")
      .moveDown(0.5);

    doc.fontSize(11).font("Helvetica");

    if (trip.cargo) doc.text(`Description: ${trip.cargo}`);
    if (trip.weight) doc.text(`Weight: ${trip.weight.toLocaleString()} kg`);
    doc.moveDown(1);
  }

  // Remarks Section
  if (trip.remarks) {
    doc.fontSize(14).font("Helvetica-Bold").text("REMARKS").moveDown(0.5);

    doc.fontSize(11).font("Helvetica").text(trip.remarks).moveDown(1);
  }

  // Horizontal line
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown(1);

  // Signature Section
  doc.fontSize(14).font("Helvetica-Bold").text("SIGNATURES").moveDown(1);

  const signY = doc.y;

  doc
    .fontSize(10)
    .font("Helvetica")
    .text("Driver Signature:", 50, signY)
    .text("Date:", 50, signY + 50)
    .text("Supervisor Signature:", 300, signY)
    .text("Date:", 300, signY + 50);

  // Signature lines
  doc
    .moveTo(50, signY + 35)
    .lineTo(200, signY + 35)
    .stroke()
    .moveTo(50, signY + 65)
    .lineTo(150, signY + 65)
    .stroke()
    .moveTo(300, signY + 35)
    .lineTo(450, signY + 35)
    .stroke()
    .moveTo(300, signY + 65)
    .lineTo(400, signY + 65)
    .stroke();

  // Footer
  doc
    .fontSize(8)
    .fillColor("#666")
    .text(
      `Generated on ${new Date().toLocaleString(
        "en-US"
      )} | TruckTrack Fleet Management System`,
      50,
      780,
      { align: "center" }
    );

  return doc;
};

export default { generateTripPDF };
