/* eslint-disable react-hooks/set-state-in-effect */
// import { Button } from "@/components/ui/button";
// import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";

// const Slider = () => {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const { featureImageList } = useSelector((state) => state.commonFeature);
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
//     }, 5000);

//     return () => clearInterval(timer);
//   }, [featureImageList]);
//   return (
//     <div className="relative w-full aspect-video md:aspect-21/9 overflow-hidden bg-white">
//       {featureImageList && featureImageList.length > 0
//         ? featureImageList.map((slide, index) => (
//             <img
//               src={slide?.image}
//               key={index}
//               alt=""
//               className={`${
//                 index === currentSlide ? "opacity-100" : "opacity-0"
//               } absolute inset-0 w-full h-full object-contain lg:object-cover object-center transition-opacity duration-1000`}
//             />
//           ))
//         : null}

//       <Button
//         variant="outline"
//         size="icon"
//         onClick={() =>
//           setCurrentSlide(
//             (prevSlide) =>
//               (prevSlide - 1 + featureImageList.length) %
//               featureImageList.length,
//           )
//         }
//         className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80"
//       >
//         <ChevronLeftIcon className="w-4 h-4" />
//       </Button>

//       <Button
//         variant="outline"
//         size="icon"
//         onClick={() =>
//           setCurrentSlide(
//             (prevSlide) => (prevSlide + 1) % featureImageList.length,
//           )
//         }
//         className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80"
//       >
//         <ChevronRightIcon className="w-4 h-4" />
//       </Button>
//     </div>
//   );
// };

// export default Slider;

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { featureImageList } = useSelector((state) => state.commonFeature);

  const len = featureImageList?.length || 0;
  const canSlide = len > 0;

  // reset slide if list changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [len]);

  // autoplay only if data exists
  useEffect(() => {
    if (!canSlide) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % len);
    }, 5000);

    return () => clearInterval(timer);
  }, [canSlide, len]);

  return (
    <div className="relative w-full aspect-video md:aspect-21/9 overflow-hidden bg-white">
      {canSlide &&
        featureImageList.map((slide, index) => (
          <img
            src={slide?.image}
            key={index}
            alt=""
            className={`${
              index === currentSlide ? "opacity-100" : "opacity-0"
            } absolute inset-0 w-full h-full object-contain lg:object-cover object-center transition-opacity duration-1000`}
          />
        ))}

      <Button
        variant="outline"
        size="icon"
        disabled={!canSlide}
        onClick={() => setCurrentSlide((prev) => (prev - 1 + len) % len)}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        disabled={!canSlide}
        onClick={() => setCurrentSlide((prev) => (prev + 1) % len)}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default Slider;
