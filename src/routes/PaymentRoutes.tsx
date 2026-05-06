import { LazyRoute } from "@/App";
import PaymentSuccessPage from "@/pages/payment/success";
import PaymentFailurePage from "@/pages/payment/failure";
import { Routes, Route } from "react-router-dom";

const PaymentRoutes = () => (
  <Routes>
    <Route
      path="success"
      element={<LazyRoute Component={PaymentSuccessPage} />}
    />
    <Route
      path="sucess"
      element={<LazyRoute Component={PaymentSuccessPage} />}
    />
    <Route
      path="failure"
      element={<LazyRoute Component={PaymentFailurePage} />}
    />
  </Routes>
);

export default PaymentRoutes;
