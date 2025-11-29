import { Suspense } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// eslint-disable-next-line no-unused-vars
const Loadable = (Component) => (props) => (
  <Suspense
    fallback={
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    }
  >
    <Component {...props} />
  </Suspense>
);

export default Loadable;
