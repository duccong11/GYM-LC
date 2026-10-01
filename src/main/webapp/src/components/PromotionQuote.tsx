import { money, todayVN } from "../utils/gym";
export type Promotion = {
  id: string;
  name: string;
  percent: number;
  start_date: string;
  end_date: string;
  active: number;
};
export default function PromotionQuote({
  price,
  promotions,
}: {
  price: number;
  promotions: Promotion[];
}) {
  const day = todayVN();
  const promo = promotions
    .filter((p) => p.active === 1 && p.start_date <= day && p.end_date >= day)
    .sort((a, b) => b.percent - a.percent || a.id.localeCompare(b.id))[0];
  return (
    <div className="payment-total full">
      <p>Giá gốc: {money(price)}</p>
      {promo && (
        <p>
          {promo.name}: giảm {promo.percent}% (
          {money(price - Math.round((price * (100 - promo.percent)) / 100))})
        </p>
      )}
      <strong>Phải trả: {money(Math.round((price * (100 - (promo?.percent || 0))) / 100))}</strong>
      <p className="muted">
        Mức giảm được kiểm tra lại khi lưu đăng ký. Giá đã chốt được giữ khi thanh toán.
      </p>
    </div>
  );
}
