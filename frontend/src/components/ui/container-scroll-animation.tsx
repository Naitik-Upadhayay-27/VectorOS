import { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, motion, type MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const scaleDimensions = () => (isMobile ? [0.7, 0.9] : [1.05, 1]);
  const rotate = useTransform(scrollYProgress, [0, 0.5], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  return (
    <div
      className="h-[35rem] md:h-[45rem] lg:h-[55rem] flex items-center justify-center relative p-2 md:p-10"
      ref={containerRef}
    >
      <div className="py-4 md:py-6 lg:py-20 w-full relative" style={{ perspective: "1000px" }}>
        <motion.div
          style={{ translateY: translate }}
          className="max-w-5xl mx-auto text-center mb-6"
        >
          {titleComponent}
        </motion.div>
        <Card rotate={rotate} scale={scale} translate={translate}>
          {children}
        </Card>
      </div>
    </div>
  );
};

const Card = ({
  rotate, scale, children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => (
  <motion.div
    style={{
      rotateX: rotate,
      scale,
      boxShadow: "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026",
    }}
    className="max-w-5xl mt-6 mx-auto h-[20rem] md:h-[28rem] lg:h-[36rem] w-full border-2 border-purple-500/40 p-2 md:p-4 bg-[#0a0a0a] rounded-[20px] md:rounded-[30px] shadow-[0_0_40px_rgba(168,85,247,0.15)]"
  >
    <div className="h-full w-full overflow-hidden rounded-2xl bg-[#030303]">
      {children}
    </div>
  </motion.div>
);

