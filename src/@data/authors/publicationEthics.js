const authors = [
  {
    t: "Article Evaluation",
    c: [
      "Peer review is required for all manuscripts, and they must also adhere to high academic standards. Submissions will be evaluated by peer reviewers, whose identities will not be disclosed to the authors, if the editor approves them. On submissions having significant ethical, security, biosecurity, or social ramifications, for example, our Research Integrity team may on occasion seek assistance beyond the realm of traditional peer review. Before deciding on the best course of action, we may consult experts and the academic editor. This may include, but is not limited to, selecting reviewers with particular expertise, having additional editors evaluate the contribution, and declining to take the submission further.",
    ],
  },
  {
    t: "Plagiarism",
    c: [
      "All of the publications that Dream Science publishes are dedicated to solely publishing original content, which is content that hasn't been published or isn't currently being reviewed anywhere else. The software is used by Dream Science to identify instances of duplicate and overlapping text in submitted publications. Sanctions for plagiarism will be applied to any manuscripts that are discovered to have been lifted verbatim from another author's work, whether it was published or not.",
    ],
  },
  {
    t: "Repetition of Submission",
    c: [
      "Sanctions for duplicate submissions and publications will be applied to manuscripts that are discovered to have been published or are currently being reviewed elsewhere. Authors who have used their own previously published work or work that is presently being reviewed as the foundation for a submitted manuscript must cite the earlier work and explain how their new work goes above and beyond what was previously done.",
    ],
  },
  {
    t: "Manipulation of Citations",
    c: [
      "Citation manipulation sanctions will be applied to submitted manuscripts that are discovered to contain citations that are primarily intended to boost the number of citations to a certain author's work or to publications published in a specific journal.",
    ],
  },
  {
    t: "Falsification and Fabrication of Data",
    c: [
      "Sanctions for data fabrication and falsification will be applied to submitted articles that contain either manufactured or falsified experimental results, including the modification of pictures.",
    ],
  },
  {
    t: "Incorrect Author Attribution or Contribution",
    c: [
      "All mentioned authors must have contributed significantly to the research in the manuscript and given their consent to all of its assertions. It's crucial to acknowledge everyone who contributed significantly to science, including students, researchers, project assistants, and lab technicians.",
    ],
  },
  {
    t: "Duplicate Publications",
    c: [
      "In redundant publications, research findings are improperly split up into many articles.",
    ],
  },
  {
    t: "Competing Interests",
    c: [
      `Conflicts of interest (COIs, commonly referred to as "competing interests") arise when circumstances unrelated to the research could be logically interpreted as influencing the objectivity or impartiality of the work or its evaluation. Whether or not they really had an impact, any conflicts of interest must be disclosed in order to make informed decisions. This declaration won't typically prohibit work from being published or always bar someone from participating in a review process.`,
      "Declare a prospective interest if unsure, or speak with the editorial office. Sanctions may result from undeclared interests. Submissions with conflicts that are not stated but are later discovered may be rejected. Published articles could need to be revised, corrected, or in extreme circumstances, withdrawn.",
    ],
  },
  {
    t: "Conflicts Compromise",
    c: [
      "Financial: money, other payments, goods, and services received or anticipated by the writers in connection with the work's subject matter or from a company with a stake in its success.",
      "Being hired by, serving on the advisory board for, or belonging to an entity with a stake in the project's result are all examples of affiliations.",
      "Intellectual property includes patents and trademarks that are owned by an individual or business.",
      "Personal - relationships with friends, family, and other intimate friends and family members",
      "Ideology is a set of views or political or religious activism that is pertinent to the work.",
      "Academic rivals or those whose work is criticised.",
    ],
  },
  {
    t: "Authors",
    c: [
      `All potential interests must be disclosed by authors in a section titled "Conflicts of Interest," along with a justification for why the interest might be a conflict. The authors should declare that there are no conflicts of interest with regard to the publication of this paper if there are none. Co-authors' declarations of interests must be made by the authors who are submitting the work.`,
      `Authors are required to disclose any current or recent financing, as well as any other payments, products, or services that may have influenced the work (including those for article processing fees). No matter if there is a conflict of interest, all funding must be disclosed in the "Acknowledgments."`,
      " Any involvement in the conception, planning, design, conduct, or analysis of the work, the preparation or editing of the manuscript, or the decision to publish of anyone other than the authors who: 1) has an interest in the outcome of the work; 2) is affiliated to an organization with such an interest; or 3) was employed or paid by a funder, must be disclosed.",
      " Editors and reviewers will take into account declared conflicts of interest and include them in the final paper.",
    ],
  },
  {
    t: "Reviewers and Editors",
    c: [
      `Editors and reviewers ought to decline to work on a submission if: possess a current submission or recent publication with any author share your affiliation with any author, new or old. collaborate with any author, or have you just lately done so?`,
      "Possess a close relationship with any author.",
      "Possess a monetary stake in the work's subject.",
      "Unable to be impartial.",
      `Reviewers must disclose any potential conflicts of interest in the "Confidential" area of the review form, where the editor will take them into account.`,
      "If editors or reviewers have spoken with the authors about the article in the past, they must disclose this.",
    ],
  },
  {
    t: "Sanctions",
    c: [
      `Regardless of whether the infractions took place in a journal published by DREAM SCIENCE, the following sanctions will be implemented if any of the aforementioned policies are violated and are documented in a journal:`,
      "Rejection of the infringement-related manuscript right away.",
      "Immediate rejection of any other manuscripts that any of the authors of the plagiarised paper have sent to any journal that is published by Dream Science.",
      "Prohibition against all authors, individually or together with other authors of the infringing work, or jointly with any other authors, for any further submissions to any journal published by Dream Science. This ban will be in place for at least 36 months.",
      "Prohibition on the participation of all authors in the any journal's editorial board that Dream Science publishes.",
      "The publisher maintains the right to impose further consequences beyond those mentioned above in situations where the violations of the aforementioned rules are thought to be extremely flagrant.",
    ],
  },
  {
    t: "Research Recording",
    c: [
      "It is crucial that the authors document the findings of their research in a way that allows for analysis and evaluation both prior to publication and for a reasonable amount of time following publication by other researchers. Fabrication is viewed as a form of scientific misconduct, is very unethical, and in some jurisdictions may even be illegal. Examples include reporting results from studies that were never undertaken, deceiving people, or intentionally misleading them.",
    ],
  },
  {
    t: "Publication Techniques",
    c: [
      "For each publication, the writers must submit their research papers in the exact format required by the journal. The writers' information should be succinct, accurate, and provide specifics on the research studies they conducted. To support their research, authors should use comparative analyses and contemporary research publications. To support their original piece of study, authors should, however, rework the data in their own words and offer it in a different way. This information should be referenced in the study publications as it was taken from the work of rivals, collaborators, and other academics. In addition, they ought to list works that helped define the parameters of the reported effort.",
    ],
  },
  {
    t: "Authorship Techniques",
    c: [
      `Authorship credit should be given based on significant contributions to the idea and design, the collection, analysis, and interpretation of data, the writing of the article or its critical revision for significant intellectual content, and the final approval of the published version. A cited author must satisfy each of these requirements. Other contributors to the research, such as those who secured funding for the study, gathered crucial information and materials, or coordinated with the publication, are significant but do not meet the criteria for authorship. The research articles can include references to these people.`,
      "It is important to identify the funding source for any research projects or publications. The submitted work's main ideas should not have been published before, and the author should explicitly state that they are not being considered for publication elsewhere. The author should explicitly state whether or not a primary research report has been published as well as any new analyses or data synthesis that have been included in the secondary research report. A 10% overlap between such journals is thought to be acceptable.",
      "Plagiarism is a wholly inappropriate practise in the world of research and is unethical. Before submitting the study paper, authors must certify that they are the copyright owners or that they have obtained the copyright owners' consent. It is unacceptable to violate copyright in any way. In addition to publications, Dream Science also freely publishes Conference Proceedings. These are meant to be tools for the community to share the most recent work-in-progress in their various fields of study. The conference planners must state that the proceedings won't be distributed to or published in any other journal.",
    ],
  },
  {
    t: "Responsibilities of Editorial",
    c: [
      "The decision to approve or reject a work submitted to a journal rests entirely with the editor, who is unaffected by management or owners in any way. While making a judgement, the editor may consult with the associate editor, co-editors, and peer reviewers. All submissions should be evaluated by the editors based solely on their scientific quality, with minimal consideration of outside circumstances. Regardless of the author's caste, culture, origin, gender, or citizenship, the decision must be prompt and equitable. Editors, writers, and peer reviewers are all required to disclose any conflicts of interest that would make it difficult for them to present or evaluate data in an unbiased manner. Relevant financial, individual, political, intellectual, or religious interests are some examples. Editors and board members should disclose their ties and interests if these are pertinent to the material being considered or published. The editorial team should only give reviewers access to information about a submitted manuscript that is being considered. Conflicts of interest should never arise in situations.",
    ],
  },
];
export default authors;

