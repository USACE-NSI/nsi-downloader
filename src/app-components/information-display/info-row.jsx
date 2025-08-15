import InfoCol from "./info-col.jsx";

function InfoRow() {
  return (
    <div className="flex justify-evenly h-48 m-2 border border-white">
      <InfoCol></InfoCol>
      <InfoCol></InfoCol>
      <InfoCol></InfoCol>
      <InfoCol></InfoCol>
      <InfoCol></InfoCol>
    </div>
  );
}

export default InfoRow;
