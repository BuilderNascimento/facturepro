/** Bloc CONDITIONS DE RÈGLEMENT — aligné sur le modèle client */

export function getPaymentConditionsHtml(): string {
  return `
    <div class="payment-conditions" style="margin-top:20px">
      <div style="font-size:12px;font-weight:700;color:#1e3a5f;letter-spacing:.06em;margin-bottom:8px;text-transform:uppercase">
        Conditions de règlement
      </div>
      <div style="background:#e8f0f7;border:1px solid #c5d4e0;border-radius:4px;padding:12px 16px;font-size:11px;color:#1f2937;line-height:1.75">
        <div>• Facture payable le 10 du mois suivant.</div>
        <div>• Pas d'escompte pour règlement anticipé.</div>
        <div>• Pénalités de retard : taux légal en vigueur (en l'absence de paiement).</div>
        <div>• En cas de retard de paiement, application d'une indemnité forfaitaire de recouvrement de 40&nbsp;€ selon l'article D.441-5 du Code du Commerce.</div>
      </div>
      <p style="text-align:right;font-size:11px;color:#374151;margin-top:10px;font-style:italic">
        Merci pour votre confiance.
      </p>
    </div>`;
}
