const autherGuideline = [
  {
    t: "Article Submission",
    c: [
      `When a manuscript is submitted, it is assumed that the work described has never been published before, is not currently being considered for publication elsewhere, and has received the implicit or explicit approval of all co-authors and responsible authorities at the institute where the work was conducted. Should there be any demands for compensation, the publisher shall not be liable.`,
    ],
  },
  {
    t: "Permissions",
    c: [
      `For both the print and online formats, authors must seek permission from the copyright owner(s) in order to use any figures, tables, or text passages that have already been published elsewhere. They must also submit documentation of this permission when submitting their articles. Without such proof, it will be considered that any material you get came from the writers.`,
    ],
  },
  {
    t: "Online Submission",
    c: [
      `<div class="space-y-3">
          <h6>Important information:</h6>
          <p>
            If authors are prompted to submit a revised version of their manuscript,
            they must indicate all changes (for example, by using coloured text or the
            track changes feature of their word processing programme) and submit the
            updated version along with a cover letter that includes an itemised response
            to the reviewer's comments.
          </p>
          <p>
            When a manuscript is submitted to Dream Science, it usually means that the
            seeds, genetic stocks, vectors, and antibodies described in the manuscript
            should be freely available to any researcher who wants to use them for
            non-commercial purposes. Requests for materials must be complied with by
            authors within 60 days of receiving the request.
          </p>
        </div>`,
    ],
  },
  {
    t: "Contribution of the Author (Author Contribution Statement)",
    c: [
      "The contributions of each listed author must be briefly described by the authors (please use initials). This will appear before the Acknowledgments in a separate section.",
      "For instance, AM and DB conceptualised and planned the study. AM and BB carried out research. GR provided fresh reagents or analytical equipment. Data were examined by AM and GR. The draught was written by AM. The article was read and approved by all writers.",
    ],
  },
  {
    t: "Title Page",
    c: [
      `<div>
        <p class="mb-3">Include the following on the title page:</p>
        <p>
          <ul class="list-disc ml-8 ">
            <li>The author's entire first name, middle initial, and last name(s).</li>
            <li>
              Avoid using undefined acronyms and write a title that is succinct and
              informative. The title should not exceed 180 characters (including
              spaces).
            </li>
            <li>The author's title, address, and affiliation(s).</li>
            <li>
              The matching author's phone number, fax number, and email address.
            </li>
            <li>
              Your institutional e-mail address should be used for correspondence.
            </li>
          </ul>
        </p>
      </div>`,
    ],
  },
  {
    t: "Principal Conclusion",
    c: [
      `Please give a brief summary of your work's primary accomplishments, excluding any messages the document title might have intended to communicate. There may not be more than 30 words in this "Principal Conclusion."`,
    ],
  },
  {
    t: "Abstract",
    c: [
      `Please include an abstract of no more than 250 words. To appeal to the Dream Science readership as a whole, the abstract should be broadly grounded. Avoid using vague references or unclear acronyms. Finish with a phrase describing how this effort advanced the field's state of the art.`,
    ],
  },
  {
    t: "Keywords",
    c: [
      `<p>
         <ul class="list-disc ml-8 ">
          <li>
            Please give 4 to 6 indexable keywords that can be used. Avoid using words
            that are already in the paper's title.
          </li>
          <li>Manuscripts should be sent in MS Word format.</li>
          <li>
            For text, use a typical, plain font (such as Times Roman in 10-point
            size).
          </li>
          <li>For emphasis, use italics.</li>
          <li>To number the pages, use the automatic page numbering feature.</li>
          <li>Uselessness of field functions</li>
          <li>
            Instead of using the space bar for indents, use tab stops or another
            command.
          </li>
          <li>To create tables, use the table function rather than spreadsheets.</li>
          <li>For equations, use Math Type or the equation editor.</li>
          <li>
            Save your document in doc or docx format (MS Word 2007 or later) (older
            Word versions).
          </li>
          <li>Mathematical manuscripts may also be submitted in LaTeX format.</li>
        </ul>
      </p>`,
    ],
  },

  {
    t: "Text",
    c: [
      `<div class="space-y-3">
          <h6>Headings</h6>
          <ul class="list-disc ml-8 ">
            <li>Please limit the number of visible heading levels to three.</li>
            <li>
              Abbreviations should be defined at the outset and used consistently
              after that.
            </li>
          </ul>
          <h6>Footnotes</h6>
          <p>
            The citation of a source included in the reference list might be inserted in
            footnotes to provide further information. They shouldn't just be a reference
            citation, and they should never include a reference's bibliographic
            information. Additionally, no tables or figures should be included.
          </p>
          <p>
            A footnote to a table should be marked with superscript lower-case letters,
            while footnotes to the text are numbered consecutively (or asterisks for
            significance values and other statistical data). There are no reference
            symbols for footnotes to the article's title or authors.
          </p>
          <p>Never use endnotes; always use footnotes.</p>
        </div>`,
    ],
  },
  {
    t: "Acknowledgments",
    c: [
      "On the title page, acknowledgments of people, grants, finances, etc. should be listed in a distinct section. The entire names of the funding organisations must be included. Units, symbols, and abbreviations in the Dream Science Please click the link to see the Dream Science collection of plant sciences units, symbols, and acronyms.",
    ],
  },
  {
    t: "Scientific Approach",
    c: [
      "Italics should be used for genus and species names.",
      "Before submitting a work for publication in Dream Science, authors must submit fresh nucleotide sequences to GenBank. For newly discovered genomic DNA, complementary DNA, RNA, and other nucleotide sequences described in the publication, an accession number must be provided.",
      "Statistical analysis of the results: The reproducibility or statistical significance of the results, particularly in relation to figures where error bars are not shown, must be stated by the authors in a subsection at the end of the materials and methods section (e.g. images, blots).",
      "If commercially available antibodies have been utilised, kindly supply the antibody product code.",
    ],
  },
  {
    t: "References",
    c: [
      `<div class="space-y-3">
        <h6>Citation</h6>
        <p>
          In the text, cite references by name and year in parentheses. Some
          instances:
        </p>
        <p>
          Numerous disciplines have studied negotiations (Thompson 1990).
        </p>
        <p>
          Becker and Seligman later refuted this finding (1996).
        </p>
        <p>
          Many studies have been done on this impact (Abbott 1991; Barakat et al.
          1995a, b; Kelso and Smith 1998; Medvec et al. 1999, 2000).
        </p>
        <h6>List of references</h6>
        <p>
          Only works that are acknowledged in the text and have been released or
          accepted for release should be listed as references. Only unpublished works
          and personal communications should be mentioned in the text. Never use a
          reference list in place of footnotes or endnotes.
        </p>
        <p>
          The last names of each work's first authors should be listed in alphabetical
          order in the reference list entries. Multi-author works by the same initial
          author should be arranged alphabetically according to second, third, etc.
          authors. Ordering of publications by the same author or authors is required.
          <ul class="list-disc ml-8 space-y-3">
            <li class="mb-0">Journal article</li>
            <p>
              Gamelin FX, Baquet G, Berthoin S, Thevenet D, Nourry C, Nottin S,
              Bosquet L (2009) Effect of high intensity intermittent training on heart
              rate variability in prepubescent children. Eur J ApplPhysiol
              105:731-738. https://doi.org/10.1007/s00421-008-0955-8.
            </p>
            <p>
              Ideally, the names of all authors should be provided, but the usage of
              “et al” in long author lists will also be accepted: Smith J, Jones M Jr,
              Houghton L et al (1999) Future of health insurance. N Engl J Med
              965:325–329.
            </p>
            <li class="mb-0">Article by DOI</li>
            <p>
              Slifka MK, Whitton JL (2000) Clinical implications of dysregulated
              cytokine production. J Mol Med. https://doi.org/10.1007/s001090000086.
            </p>
            <li>Book</li>
            <p>
              South J, Blass B (2001) The future of modern genomics. Blackwell,
              London.
            </p>
            <li class="mb-0">Book chapter</li>
            <p>LTWA ISSN</p>
            <p>
              Please use the complete journal title if you are unsure.
            </p>
            <p>
              Important information: While it's ideal to give the names of all
              authors, "et al" will also be permitted in lengthy author lists with
              more than 15 authors. Please always list three writers or more:
            </p>
            <p>
              Future of health insurance, by Smith J, Jones M Jr, Houghton L, et al.
              965:325-329 N Engl J Med.
            </p>
            <p>
              Brown B, Aaron M (2001) The politics of nature. In: Smith J (ed) The
              rise of modern genomics, 3rd edn. Wiley, New York, pp 230-257.
            </p>
            <li class="mb-0">Online document</li>
            <p>
              Cartwright J (2007) Big stars have weather too. IOP Publishing
              PhysicsWeb. http://physicsweb.org/articles/news/11/6/16/1. Accessed 26
              June 2007
            </p>
          </ul>
        </p>
      </div>`,
    ],
  },
  {
    t: "Tables",
    c: [
      `<p>
        <ul class="list-disc ml-8 ">
          <li>Arabic numbers must be used to identify each table.</li>
          <li>
            In the text, tables must always be mentioned in consecutive numerical
            order.
          </li>
          <li>
            Please include a table caption (title) outlining the table's elements for
            each table.
          </li>
          <li>
            Indicate any content that has already been published by providing a
            reference to the original publication at the end of the table caption.
          </li>
          <li>
            Table footnotes should be provided below the table body and should be
            denoted by superscript lower-case letters (or asterisks for significance
            values and other statistical data).
          </li>
        </ul>
      </p>`,
    ],
  },
  {
    t: "Artwork",
    c: [
      "It is strongly advised that you submit all of your artwork in an electronic format, including photos, line drawings, etc., for the highest quality final outcome. Then, your artwork will be created to the highest standards and with the utmost attention to detail. The calibre of the submitted artwork will be clearly visible in the published work.",
    ],
  },
  {
    t: "Electronic Submission of Figures",
    c: [
      `<div class="space-y-3">
        <h6>Definition of line art: </h6>
        <p>
          <ul class="list-disc ml-8 ">
            <li>A graphic in black and white without any shading.</li>
            <li>
              Make sure that all of the lines and letters inside the figures are
              readable at final size and avoid using thin lines and/or lettering.
            </li>
            <li>Every line needs to be at least 0.3 points (0.1 mm) wide.</li>
            <li>
              Line drawings that are scanned and those that are in bitmap format need
              to have a minimum resolution of 1200 dpi.
            </li>
            <li>
              Fonts used in vector graphics must be included in the files themselves.
            </li>
          </ul>
        </p>
        <h6>Art in Halftone</h6>
        <ul class="list-disc ml-8 ">
          <li>Finely shaded images, sketches, or paintings are defined.</li>
          <li>
            Use scale bars within the figures themselves to indicate any magnification
            that was applied to the pictures.
          </li>
          <li>Halftones need to be at least 300 dpi in resolution.</li>
        </ul>
        <h6>Combination Art</h6>
        <p>
          A mixture of halftone and line art, such as halftones with detailed
          typography, colour diagrams, or other elements, is referred to as
          combination art.
        </p>
        <p>
          A resolution of 600 dpi should be required for combination artwork.
        </p>
        <h6>Art in Color</h6>
        <p>
          <ul class="list-disc ml-8 ">
            <li>For use in print and online publications, colour art is free.</li>
            <li>The RGB format should be used for colour illustrations.</li>
          </ul>
        </p>
        <h6>Figure Lettering</h6>
        <p>
          <ul class="list-disc ml-8 ">
            <li>
              The ideal fonts to use for lettering are Helvetica or Arial (sans serif
              fonts).
            </li>
            <li>
              Keep your final-sized artwork's writing at a constant size, often
              between 2-3 mm (8–12 pt).
            </li>
            <li>
              There shouldn't be much variation in type size within an illustration,
              so avoid using, for instance, an axis with 8-pt type and an axis label
              with 20-pt type.
            </li>
            <li>Avoid using effects like letter outlining or shading.</li>
            <li>Your illustrations should not have titles or captions.</li>
          </ul>
        </p>
        <h6>Figure referencing</h6>
        <p>
          <ul class="list-disc ml-8 ">
            <li>
              Arabic numerals are should be used to number each and every figure.
            </li>
            <li>
              In the text, figures must always be quoted in consecutive numerical
              order.
            </li>
            <li>
              Lowercase letters should be used to indicate figure sections (a, b, c,
              etc.).
            </li>
            <li>
              Continue the main text's sequential numbering if your article includes
              an appendix that contains one or more figures. The appendix figures
              should not be numbered "A1, A2, A3, etc." However, figures in electronic
              appendices (supplemental material) should be given their own numbers.
            </li>
          </ul>
        </p>
        <h6>Images with captions</h6>
        <p>
          <ul class="list-disc ml-8 ">
            <li>
              Each figure should include a brief description that accurately describes
              what it represents. Include the captions in the manuscript's text file
              rather than the figure file.
            </li>
            <li>
              In bold font, the word "Fig." is used at the start of each figure
              caption, which is followed by the figure's number.
            </li>
            <li>
              Both the number and the caption must be written without any punctuation,
              either before or after the number.
            </li>
            <li>
              Use boxes, circles, etc., as coordinate points in graphs and list all of
              the figure's components in the caption.
            </li>
            <li>
              Put a reference citation at the end of the figure caption to indicate
              any content that has already been published.
            </li>
          </ul>
        </p>
        <h6>Size and Position of the Figure</h6>
        <p>
          <ul class="list-disc ml-8 ">
            <li>Size your figures to fit the column width while preparing them.</li>
            <li>
              For the majority of journals, the figures must be no taller than 234 mm
              and no wider than 39 mm, 84 mm, 129 mm, or 174 mm.
            </li>
            <li>
              The figures should be 80 mm or 122 mm broad and no higher than 198 mm
              for books and book-sized magazines.
            </li>
          </ul>
        </p>
        <h6>Permissions</h6>
        <p>
          For both the print edition and the web version, you need the owner(s) of the
          copyright before including any figures that have already been published
          elsewhere else. Please note that certain publishers do not provide free
          electronic rights, and Dream Science is unable to reimburse any fees that
          may have been used to obtain these permits. In these circumstances,
          information from other sources ought to be utilised.
        </p>
        <h6>Accessibility</h6>
        <p>
          Please make sure that your figures' content is accessible to persons with
          all skills and impairments by following the following guidelines:
          <ul class="list-disc ml-8 ">
            <li>
              All images have detailed subtitles (blind users could then use a
              text-to-speech software or a text-to-Braille hardware).
            </li>
            <li>
              Information can be conveyed using patterns instead of or in addition to
              colours (color-blind users would then be able to distinguish the visual
              elements).
            </li>
            <li>Any figure lettering has at least a 4.5:1 contrast ratio.</li>
          </ul>
        </p>
      </div>`,
    ],
  },
  {
    t: "Electronic Supporting Information",
    c: [
      `<div class="space-y-3">
        <p>
          To be published online alongside an article or book chapter, DREAM SCIENCE
          welcomes electronic multimedia items (animations, movies, audio, etc.). Due
          to the fact that some information cannot be printed or is more practical in
          electronic form, this function can add depth to the author's piece.
        </p>
        <p>
          Research datasets should be reviewed before being submitted as electronic
          supplementary material. Wherever it is feasible, research data should be
          archived in data repositories.
        </p>
        <p>
          <h6>Submission</h6>
          <ul class="list-disc ml-8 ">
            <li>
              Provide all supporting documents in industry-standard file formats.
            </li>
            <li>
              Please include the following details in each file: the title of the
              paper, the journal it was published in, the names of the authors, their
              affiliations, and their email addresses.
            </li>
            <li>
              Please be aware that larger files may take a very long time to download
              and that some users might run into other issues while doing so in order
              to accommodate user downloads.
            </li>
            <li>Animations, audio, and video.</li>
            <li>Ratio of aspect: 16:9 or 4:3.</li>
            <li>25 GB is the maximum file size.</li>
            <li>Minimum video length: one second.</li>
            <li>
              File types that are supported include avi, wmv, mp4, mov, m2p, mp2, mpg,
              mpeg, flv, mxf, mts, m4v, and 3gp.
            </li>
          </ul>
          <h6>Text and Slide Shows</h6>
          <ul class="list-disc ml-8 ">
            <li>
              For long-term viability, submit your information in PDF format;.doc
              or.ppt files are not acceptable.
            </li>
            <li>A PDF file may also contain a collection of figures.</li>
          </ul>
          <h6>Spreadsheets</h6>
          <ul class="list-disc ml-8 ">
            <li>
              Spreadsheet submissions must be made as.csv or.xlsx files (MS Excel).
            </li>
          </ul>
          <h6>Dedicated Formats</h6>
          <ul class="list-disc ml-8 ">
            <li>
              Spreadsheet submissions must be made as.csv or.xlsx files (MS Excel).
            </li>
          </ul>
          <h6>Getting Several Files</h6>
          <ul class="list-disc ml-8 ">
            <li>A.zip or.gz file can contain a collection of many files.</li>
          </ul>
          <h6>Numbering</h6>
          <ul class="list-disc ml-8 ">
            <li>
              Similar to how figures and tables are cited, the text must specifically
              refer to any supplemental information if it is provided.
            </li>
            <li>
              Use the phrase "Online Resource" when referring to the supplemental
              files, such as "... as seen in the animation (Online Resource 3)," or
              "... further data are presented in Online Resource 4."
            </li>
            <li>Name the files in order, for example, "ESM 3.mpg," "ESM 4.pdf."</li>
          </ul>
          <h6>Captions</h6>
          <ul class="list-disc ml-8 ">
            <li>
              Please provide a brief caption explaining the contents of each
              supplemental file.
            </li>
          </ul>
        </p>
      </div>`,
    ],
  },
  {
    t: "Processing of Supporting Documents",
    c: [
      "Electronic supplemental material will be published just as it was submitted by the author, without modification or formatting.",
    ],
  },
  {
    t: "Authors' Obligations in Terms of Ethics",
    c: [
      "The integrity of the scientific record is something that our magazine is dedicated to protecting. As a participant in the Committee on Publication Ethics (COPE), the journal will adhere to its rules on potential instances of misconduct.",
      "Authors should avoid misrepresenting study findings since doing so might undermine reader confidence in the journal, undermine the credibility of scientific authors, and eventually undermine the entire field of science. Following the guidelines of good scientific practise, which include the following, will help to maintain the integrity of the study and its presentation.",
      "No more than one journal has received the paper for simultaneous review.",
      `The manuscript hasn't been published before (either in full or in part), unless the new work is an enlargement of earlier work (please be transparent about the reuse of content to prevent the appearance of "self-plagiarism").`,
      "A single study is not divided into many pieces in order to submit it to more journals or to one journal over time (salami publishing, for example).",
      "No information, including photographs, has been falsified or altered to support your assertions.",
      "Plagiarism is the practise of presenting facts, information, or hypotheses created by someone else as the author's own. When using content that has been closely reproduced (almost verbatim), summarised, or paraphrased, proper acknowledgements to other works must be made, quotation marks must be used, and copyrighted material must have authorization before being utilised.",
      "Important information: The journal may check for plagiarism using software.",
      "Before the work is submitted, express permission to publish has been obtained from each co-author as well as from the accountable individuals at the institute or organisation where the work was done.",
      "The authors whose names are on the submission have made adequate contributions to the scientific study and are thus jointly responsible and accountable for the outcomes.",
      "It is strongly encouraged for writers to double check their author groups, corresponding authors, and author order before submitting their work. After an article has been accepted, changes to the order of the authors or the authors' names are not allowed.",
      "Author additions, deletions, and changes to author order may be legitimately justified during the revision stage. The amended manuscript must be submitted with a note that details the changes made as well as the authors who were added or removed from the paper and their contributions(s). Your request might need to be supported by more documentation.",
      "After formal notice by the institute or independent authority and/or where there is consensus among all authors, requests for the inclusion or removal of authors due to authorship disputes after approval are honoured.",
      "In order to confirm the accuracy of the findings, writers should be prepared to supply pertinent data or documents upon request. This could take the shape of unprocessed data, samples, records, etc. Confidential proprietary information including sensitive information can be excluded.",
      "Dream Science will follow the COPE criteria when conducting an inquiry if there is any indication of wrongdoing. The accused author will be notified and given the chance to respond if further research reveals that the claim has merit. The Editor-in-Chief may take any of the following actions if misbehaviour is proven beyond a reasonable doubt, including, but not limited to:",
      "The article could be rejected and sent back to the author if it's still being considered.",
      `Depending on the nature and severity of the infringement, if the article has already been published online, either an erratum will be included with the piece, or in extreme situations, the whole article may be retracted. The explanation must be included in the erratum or retraction notice that was published. Please take notice that retracting a paper entails keeping it on the platform, having it watermarked "retracted," and explaining the retracting in a note that is linked to the watermarked item.`,
      "The institution of the author may be notified.",
    ],
  },
  {
    t: "Adherence to Moral Principles",
    c: [
      "Authors should provide information about funding sources, potential conflicts of interest (financial or non-financial), informed consent if the research involved human participants, and a statement on the welfare of animals if the research involved animals in order to ensure objectivity and transparency in research and to ensure that accepted principles of ethical and professional conduct have been followed.",
      `When submitting a study, authors should make the following claims (if appropriate) in a separate section headed "Compliance with Ethical Standards":`,
      "Potential conflict of interest disclosure.",
      "Informed permission for research involving human subjects or animals.",
      "Please be aware that standards may differ significantly depending on the peer review procedures used by the journal (e.g., single or double blind peer review) and the area of study covered by the journal. Review the detailed guidelines that follow this section before submitting your essay.",
      "When asked to provide proof of ethical compliance during peer review or after publication, the corresponding author should be ready to do so.",
      "Manuscripts that don't follow the aforementioned rules may be rejected by the editors at their discretion. False remarks or failure to adhere to the aforementioned rules will be held against the author.",
    ],
  },
  {
    t: "Potential Conflict of Interest Disclosure",
    c: [
      `<p>
        Every relationship or interest that might directly or indirectly sway the work
        or introduce bias must be disclosed by the authors. Even if the author does
        not see a conflict, the disclosure of affiliations and interests allows for a
        more thorough and open approach, which results in an accurate and unbiased
        evaluation of the work. The readers have a right to knowledge of any actual or
        apparent conflicts of interest. This is not intended to indicate that a
        financial connection to a company that funded the study or payment for
        consulting services is improper. The following are only a few examples of
        potential conflicts of interest that might be directly or indirectly connected
        to the research:
        <ul class="list-disc ml-8 ">
          <li>
            Research financing from funding organisations (please give the research
            funder and the grant number)
          </li>
          <li>Speaking fees at symposiums</li>
          <li> Assistance with the cost of attending symposiums</li>
          <li>Financial assistance for educational initiatives</li>
          <li>Working or consulting</li>
          <li>
            Position on an advisory board, a board of directors, or another sort of
            management connection Support from a project sponsor.
          </li>
          <li>Many associations</li>
          <li>Financial ties, such as ownership of stock or an investing stake</li>
          <li>
            rights to intellectual property (e.g. patents, copyrights and royalties
            from such rights)
          </li>
          <li>
            spouse's and/or kids' holdings that might have a financial stake in the
            project
          </li>
        </ul>
      </p>
`,
      "Supporting organizations that support research (please give the research funder and the grant number)",
      "Getting paid to talk at symposiums monetary assistance for symposium attendance funding for educational initiatives either consulting or employment. Position on an advisory board, a board of directors, or another sort of management connection Several affiliations.",
      "Financial connections, such as equity ownership or an investing stake rights to a person's creations (e.g. patents, copyrights and royalties from such rights) holdings of a spouse or kids who could have a financial stake in the project.",
      "Funding: X provided funding for this study (grant number X).",
      "Author A has received research money from Company A, which presents a conflict of interest. Author B is a shareholder in Company Y and has received a speech fee from Company X. Member of committee Z is author C.",
      "If there is no controversy, the writers should say:",
      "Conflicts of Interest: The writers affirm that they are impartial.",
    ],
  },
  {
    t: "Policy on Research Data",
    c: [
      "Any researcher desiring to utilise the resources detailed in the publication for non-commercial reasons without violating participant confidentially will be entitled to do so without paying for them if they are submitted to the journal. This includes all relevant raw data.",
      "The publication highly recommends that readers get access to all datasets used to support the paper's conclusions. We advise authors to make sure that their datasets are either given in the primary publication or supplementary supporting files wherever feasible, or that they are deposited in publicly accessible repositories (where available and acceptable). Where suitable, general repositories for all forms of research data, like figshare and Dryad, may be used.",
      "The reference list may include references to datasets that have been given Digital Object Identifiers (DOIs) by a data repository. The bare minimum recommended by DataCite for data citations is authors, title, publisher (repository name), and identifier.",
      `<h6 class="font-medium">
        <a class="text-light-blue hover:text-blue" href="https://datacite.org/" target="_blank">
          DataCite
        </a>
      </h6>
      <p>
        Where there is a well-established expectation among the research community for
        data to be archived in public repositories, submission to a community-endorsed
        public repository is required. The publication must include persistent
        identifiers (such DOIs and accession numbers) for pertinent datasets.
      </p>`,
      "Submission to a publicly accessible repository recognised by the community is required for the following kinds of data sets:",
      `<table class="border-separate border-spacing-x-5 md:border-spacing-x-10 -ml-5 md:-ml-10">
          <tr>
            <th>Mandatory deposition</th>
            <th>Suitable repositories</th>
          </tr>
          <tr>
            <td>Protein sequences</td>
            <td>Uniprot</td>
          </tr>
          <tr>
            <td>DNA and RNA sequences</td>
            <td>Genbank<br>DNA DataBank of Japan (DDBJ)<br>EMBL Nucleotide Sequence Database (ENA)<br></td>
          </tr>
          <tr>
            <td>Genetic polymorphisms</td>
            <td>dbSNP<br>dbVar<br>European Variation Archive (EVA)<br></td>
          </tr>
          <tr>
            <td>Linked genotype and phenotype data</td>
            <td>dbGAP<br>The European Genome-phenome Archive (EGA)<br></td>
          </tr>
          <tr>
            <td>Macromolecular structure</td>
            <td>Worldwide Protein Data Bank (wwPDB)<br>Biological Magnetic Resonance Data Bank (BMRB)<br>Electron Microscopy Data Bank (EMDB)<br></td>
          </tr>
          <tr>
            <td>Microarray data (must be MIAME compliant)</td>
            <td>Gene Expression Omnibus (GEO)<br>ArrayExpress<br></td>
          </tr>
          <tr>
            <td>Crystallographic data for small molecules</td>
            <td>Cambridge Structural Database</td>
          </tr>
        </table>
      `,
      `<h6>Availability of Data</h6>
      <p>
        The publication invites writers to include a note about the availability of data in their work. Data availability statements should provide information on the sources of the data used to support the findings in the article, including, if appropriate, hyperlinks to publically available datasets used in the analysis or generation of the data. If necessary, data availability declarations can additionally declare whether or not data are accessible upon request from the authors and when none are.
      </p>`,
      "If necessary for numerous datasets, a mix of the following formats may be used for data availability statements:",
      `<ul class="list-disc ml-8 ">
        <li>
          1. The [NAME] repository, [PERMANENT WEB LINK TO DATASETS], houses the
          datasets created for and/or analysed in the current study.
        </li>
        <li>
          2. The datasets created and/or analysed during the current study are not
          publically available because of [REASON WHY DATA ARE NOT PUBLIC], but they
          are available from the corresponding author upon justifiable request.
        </li>
        <li>
          3. Upon reasonable request, the corresponding author will provide the
          datasets created and/or analysed during the current work.
        </li>
        <li>
          4. Since no datasets were created or analysed for this article, data sharing
          is not relevant.
        </li>
        <li>
          5. This published paper [and its additional information files] contain all
          data produced or analysed during this investigation.
        </li>
      </ul>`,
    ],
  },
  {
    t: "After Approval",
    c: [
      "When your piece is accepted, you will receive a link in the mail that you may use to return the copyright transfer statement to the editor after signing it.",
      "Your article will be processed when this step is finished, and you'll get the proofs.",
      `<h6>Transfer of Copyright</h6>
      <p>
        Authors will be required to provide the publisher the article's copyright (or grant the publisher exclusive publication and dissemination rights). As a result, information will be protected and shared as widely as possible in accordance with copyright rules.
      </p>`,
      `<h6>Offprints</h6>
      <p>
        The associated author may place an order for offprints.
      </p>`,
      `<h6>Color Illustrations</h6>
      <p>
        Color illustrations can be published for free.
      </p>`,
      `<div class="space-y-3">
        <h6>Checking for Accuracy</h6>
        <p>
         The proof's objective is to examine the text, tables, and figures for completeness and correctness as well as any typesetting or conversion mistakes. Significant material modifications, such as new findings, corrected values, title changes, and author changes, are not permitted without the Editor's consent.
        </p>
        <p>
         Further edits after online publication are only permitted in the form of an erratum that links back to the original article.
        </p>
      </div>`,
      `<div class="space-y-3">
        <h6>Online Initial</h6>
        <p>
         After receiving the revised proofs, the article will be posted online. The official first publication that may be cited with a DOI is this one. The document can also be referenced by issue and page numbers after it has been published in print.
        </p>
        <p>
         You may publish open access in Dream Science journals through special issues, increasing the visibility and use of your research as soon as it is published.
        </p>
      </div>`,
      `<div class="space-y-3">
        <h6>Benefits</h6>
        <p>
         Increased researcher involvement: Anyone with an internet connection may view SPECIAL ISSUES articles as soon as they are published.
        </p>
        <p>
         Greater exposure and impact: SPECIAL ISSUES papers are read 4 times more frequently on average and are referenced 1.7 times more frequently on average in Dream Science journals than other journals.
        </p>
        <p>
         Articles published under the terms of the CC BY Open Choice licence do not necessitate the transfer of any copyright because the author retains ownership of the material. The authors consent to publishing their work under the Creative Commons Attribution License by choosing open access.
        </p>
        <p>Verify the licensing agreements 
        <a class="text-light-blue hover:text-blue" href="https://creativecommons.org/licenses/by-nc-nd/4.0/">(https://creativecommons.org/licenses/by-nc-nd/4.0/)</a>.
        </p>
      </div>`,
    ],
  },
  {
    t: "Language Editing in English",
    c: [
      "You must make sure the English language is of a suitable calibre to be understood if you want editors and reviewers to evaluate the work given in your submission appropriately. If you want assistance writing in English, take into account:",
      "Requesting that a coworker who is a native English speaker go over your writing for clarity.",
      "Seeking for the English language instruction that addresses the typical errors made when writing in English by using a professional language editing service, where editors will make your English more clear and point out any issues that need your assessment.",
      "If your submission is approved, our copyeditors will review it for formality and spelling before publishing.",
    ],
  },
];

export default autherGuideline;
