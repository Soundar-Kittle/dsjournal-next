"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useBanners } from "@/services";
import Link from "next/link";

const HeroBanner = () => {
  const { data: banner, isLoading: bannerLoading } = useBanners();
  const slides = banner?.rows || [];

  if (bannerLoading) {
    return (
      <div className="flex justify-center items-center h-[90vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const getJustify = (align) => {
    switch (+align) {
      case 1:
        return "md:justify-start md:text-left justify-center text-center";
      case 2:
        return "md:justify-end md:text-right justify-center text-center";
      default:
        return "justify-center text-center";
    }
  };

  const getTextAlign = (align) => {
    switch (+align) {
      case 1:
        return "ml-0 mr-auto";
      case 2:
        return "mr-0 ml-auto";
      default:
        return "mx-auto";
    }
  };

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="relative"
    >
      <CarouselContent>
        {slides
          .filter((slide) => slide.status === 1)
          .map((slide, i) => {
            const justify = getJustify(slide.alignment);
            const marginSide = getTextAlign(slide.alignment);
            const visibility = slide.visibility || {};

            return (
              <CarouselItem key={i} className="w-full h-full">
                <div className="relative h-full w-full py-15">
                  <Image
                    src={`${slide.image}`}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority={i === 0}
                  />
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div
                    className={`relative z-10 h-full flex items-center ${justify}`}
                  >
                    <div className="container mx-auto px-4">
                      {+visibility.show_content === 1 && (
                        <div
                          className={`max-w-3xl text-white space-y-5 ${marginSide}`}
                        >
                          <h1 className="text-3xl md:text-5xl font-semibold leading-tight text-white">
                            {slide.title}
                          </h1>
                          {+visibility.show_description === 1 && (
                            <p className="text-base">{slide.description}</p>
                          )}

                          {+visibility.show_button === 1 &&
                            slide.button_link && (
                              <Link
                                href={slide.button_link}
                                className="inline-block py-2 bg-primary text-white px-6 rounded-full hover:text-secondary font-semibold transition duration-300"
                              >
                                {slide.button_name}
                              </Link>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
      </CarouselContent>
    </Carousel>
  );
};

export default HeroBanner;
