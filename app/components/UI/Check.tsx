import React from "react";

const Check = () => {
  return (
    <section>
      <div className="bg-black text-white py-20">
        <div className="container mx-auto flex flex-col md:flex-row items-center my-12 md:my-24 px-4">
          <div className="flex flex-col w-full lg:w-1/3 justify-center items-start p-8">
            <h1 className="text-3xl md:text-5xl p-2 text-yellow-300 tracking-loose">
              TechFest
            </h1>
            <h2 className="text-3xl md:text-5xl leading-relaxed md:leading-snug mb-2">
              Space : The Timeless Infinity
            </h2>
            <p className="text-sm md:text-base text-gray-50 mb-4">
              Explore your favourite events and register now to showcase your
              talent and win exciting prizes.
            </p>
            <a
              href="#"
              className="bg-transparent hover:bg-yellow-300 text-yellow-300 hover:text-black rounded shadow hover:shadow-lg py-2 px-4 border border-yellow-300 hover:border-transparent"
            >
              Explore Now
            </a>
          </div>

          {/* Images collage */}
          <div className="p-8 mt-8 md:mt-0 ml-0 md:ml-12 lg:w-2/3 flex justify-center">
            <div className="relative flex items-center justify-center w-full max-w-xl">
              {/* Left image (tilted left, behind) */}
              <div
                className="absolute left-0 top-8 w-36 h-48 md:w-44 md:h-56 overflow-hidden rounded-full shadow-lg transform -rotate-12 -translate-x-8 z-10"
                aria-hidden="true"
              >
                <img
                  src="/images/bento1.png"
                  alt="Bento example"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Center image (front, slightly rotated) */}
              <div className="relative w-44 h-60 md:w-56 md:h-72 overflow-hidden rounded-full shadow-2xl transform rotate-3 z-30">
                <img
                  src="/images/pharmacy.jpg"
                  alt="Pharmacy example"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right image (tilted right, behind) */}
              <div className="absolute right-0 top-12 w-36 h-48 md:w-44 md:h-56 overflow-hidden rounded-full shadow-lg transform rotate-12 translate-x-8 z-20">
                <img
                  src="/images/doc.png"
                  alt="Document example"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Check;
