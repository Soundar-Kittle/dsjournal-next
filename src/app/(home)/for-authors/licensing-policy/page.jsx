import Image from "next/image";

const page = () => {
  return (
    <section className="space-y-3">
      <h1 className="text-4xl font-medium">
        Copyright and Licensing Policy
      </h1>
      <h5>Copyright</h5>
      <p>
        Authors will be asked to transfer copyright of the article to the
        publisher (or grant the Publisher exclusive publication and
        dissemination rights). This will ensure the widest possible protection
        and dissemination of information under copyright laws.
      </p>
      <h5>Licensing</h5>
      <Image src="/images/88x31.png" width={88} height={31} alt="88x31" />
      <p>
        Dream Science site and its metadata are licensed under CC-BY-NC-ND 4.0
      </p>
      <h5>Attribution-NonCommercial CC BY-NC-ND 4.0</h5>
      <p>
        Copyright on any open access article published in Dream Science
        International Journals is retained by the author(s). Authors grant Dream
        Science a license to publish the article and identify itself as the
        original publisher. Authors also grant any third party the right to use
        the article freely as long as its integrity is maintained and its
        original authors, citation details and publisher are identified.
      </p>
      <h5>Creative Commons License</h5>
      <p>
        Dream Science International Journals publishes open access articles
        under a Attribution-NonCommercial-No Derivatives 4.0 International (CC
        BY-NC-ND 4.0). This license permits user to freely share (copy,
        distribute and transmit) and adapt the contribution including for
        commercial purposes, as long as the author is properly attributed.
      </p>
      <h5>Publishing Rights</h5>
      <p>
        Dream Science allows its author(s) to retain publishing rights without
        restrictions.
      </p>
    </section>
  );
};

export default page;
