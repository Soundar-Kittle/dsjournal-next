import Image from "next/image";

const AboutUs = () => {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold text-center  mb-12">About Us</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Image */}
        <div className="relative w-full h-[320px] md:h-[420px] overflow-hidden">
          <Image
            src="/images/about.jpg"
            alt="About Dream Science"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>

        {/* Right: Text */}
        <div className="space-y-5 leading-relaxed text-justify">
          <p>
            Dream Science is a global community of scientists who adhere to the
            same fundamental research methodology standards and general
            conceptions of Science. The processes can either help or hinder the
            achievement of the goal of assisting humanity. Dream Science will
            also take into account the processes through which scientific
            knowledge and technology are directed, disseminated, and applied, as
            well as the effects of such processes on the selection of what
            research is done and on the outcomes achieved. Dream Science is a
            service-based nonprofit research organization founded in India,
            furnishing supports and services to education professionals and
            researchers around the globe without any cost or financial
            expectation. Our mission has always focused on helping our
            researchers succeed, wherever they are in their education and
            professional careers.
          </p>

          <p>
            We are strengthening the research community by partnering with
            learned societies and supporting researchers to communicate
            discoveries that make a difference. We collaborate with authors,
            societies, libraries, and other members of the research community to
            generate, communicate, and enable access to the scientific and
            scholarly insights that are helping to solve some of the world’s
            biggest challenges.
          </p>

          <p>
            Our commitment to partnership helps us advance innovation and
            connect researchers, learners, and professionals with the content,
            platforms, and tools they need to be successful.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
