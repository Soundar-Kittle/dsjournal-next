import { generateDynamicMeta } from "@/lib/seo/generateDynamicMeta";

export async function generateMetadata() {
  return await generateDynamicMeta("for-reviewers");
}

const page = () => {
  return (
    <section className="space-y-3 [&_h3,h4]:font-semibold">
      <h2 className="text-4xl font-medium">Reviewers</h2>
      <h3>1. Respond Promptly to Invitations</h3>
      <p>
        When you receive an invitation to review, the article’s abstract will
        help you decide whether it’s within your area of interest and expertise.
        Remember to respond promptly or else you might delay the process.
      </p>
      <h3>2. Show Integrity</h3>
      <p>
        Keep the contents of any manuscripts you’re reviewing confidential. You
        would expect the same of others reviewing your own work. What’s more, if
        you’ve submitted similar research of your own, or if you’ve reviewed the
        article for a different journal, let the editor know there’s a conflict
        of interest. Agreeing to a review for personal gain is not the done
        thing.
      </p>
      <h3>3. Stay Within Scope</h3>
      <p>
        When commenting, make sure your remarks stay within the scope of the
        paper and don’t veer off subject. If you’re unclear of the scope,
        editorial policy, presentation and submission requirements, speak to the
        editor or read the Author Guidelines.
      </p>
      <h3>4. Be Constructive</h3>
      <p>
        Your review should ultimately help the author improve the paper. So make
        sure you offer some constructive feedback, even if your recommendation
        ends up being to reject.
      </p>
      <h3>5. Allocate Enough Time</h3>
      <p>
        Carefully analyzing and commenting on a manuscript can take a good chunk
        of time. Make sure you have enough time available when taking on a
        review.
      </p>
      <h3>6. Be Consistent</h3>
      <p>
        Structure your comments by numbering them. It makes the editor’s life a
        lot easier. You can also divide them into major and minor issues to help
        authors prioritize corrections. Keep comments to authors separate from
        the confidential ones to editors. But make sure your comments to authors
        correspond to your assessment on the confidential review and checklists.
      </p>
      <h3>7. Focus on the Research</h3>
      <p>
        If you’re reviewing a paper that’s in English but wasn’t written by a
        native speaker, it’s good to be tolerant and point out elements that
        change the meaning, rather than commenting on the quality of their
        English.
      </p>
      <h3>8. Look at the Conclusion First</h3>
      <p>
        The conclusion will give you a good idea whether the research is an
        exciting development within its own field.
      </p>
      <h3>9. Check Robustness of Facts</h3>
      <p>
        Editors find it useful if you comment on the number of replicates,
        controls and statistical analyses. Strong statistics are crucial to
        determining whether the outcome is robust.
      </p>
      <h3>10. Give Credit Where It’s Due</h3>
      <p>
        If a paper you’re reviewing is really good and an excellent addition to
        the existing literature, don’t be afraid to say so.
      </p>
      <section id="guide-to-reviewers" className="scroll-mt-30 space-y-3">
        <h3>Step by Step Guide to Reviewers</h3>
        <p>
          When you receive an invitation to peer review, you should be sent a
          copy of the paper's abstract to help you decide whether you wish to do
          the review. Try to respond to invitations promptly - it will prevent
          delays. It is also important at this stage to declare any potential
          conflicts of interest.
        </p>
        <h3>Overview of the Review Report Format</h3>
        <p>
          The structure of the review report varies between journals. Some
          follow an informal structure, while others have a more formal
          approach.
        </p>
        <h3>Informal Structure</h3>
        <p>
          Many journals don't provide criteria for reviews beyond asking for
          your 'analysis of merits'. In this case, you may wish to familiarize
          yourself with examples of other reviews done for the journal, which
          the editor should be able to provide or, as you gain experience, rely
          on your own evolving style.
        </p>
        <h3>Formal Structure</h3>
        <p>
          Other journals require a more formal approach. Sometimes they will ask
          you to address specific questions in your review via a questionnaire.
          Or they might want you to rate the manuscript on various attributes
          using a scorecard. Often you can't see these until you log in to
          submit your review. So when you agree to the work, it's worth checking
          for any journal-specific guidelines and requirements. If there are
          formal guidelines, let them direct the structure of your review.
        </p>
        <h3>In Both Cases</h3>
        <p>
          Whether specifically required by the reporting format or not, you
          should expect to compile comments to authors and possibly confidential
          ones to editors only.
        </p>
        <h3>The First Read-Through</h3>
        <p>
          Following the invitation to review, when you'll have received the
          article abstract, you should already understand the aims, key data and
          conclusions of the manuscript. If you don't, make a note now that you
          need to feedback on how to improve those sections.
        </p>
        <p>
          The first read-through is a skim-read. It will help you form an
          initial impression of the paper and get a sense of whether your
          eventual recommendation will be to accept or reject the paper.
        </p>
        <h3>First Read Considerations</h3>
        <div>
          <p>
            Keep a pen and paper handy when skim-reading. Try to bear in mind
            the following questions - they'll help you form your overall
            impression:
          </p>
          <ul className="list-disc ml-8">
            <li>
              What is the main question addressed by the research? Is it
              relevant and interesting?
            </li>
            <li>
              How original is the topic? What does it add to the subject area
              compared with other published material?
            </li>
            <li>
              Is the paper well written? Is the text clear and easy to read?
            </li>
            <li>
              Are the conclusions consistent with the evidence and arguments
              presented? Do they address the main question posed?
            </li>
            <li>
              If the author is disagreeing significantly with the current
              academic consensus, do they have a substantial case? If not, what
              would be required to make their case credible?
            </li>
            <li>
              If the paper includes tables or figures, what do they add to the
              paper? Do they aid understanding or are they superfluous?
            </li>
          </ul>
        </div>
        <h3>Spotting Potential Major Flaws</h3>
        <p>
          While you should read the whole paper, making the right choice of what
          to read first can save time by flagging major problems early on.
        </p>
        <h3>Examples of Possibly Major Flaws Include:</h3>
        <div>
          <ul className="list-disc ml-8">
            <li>
              Drawing a conclusion that is contradicted by the author's own
              statistical or qualitative evidence.
            </li>
            <li>The use of a discredited method.</li>
            <li>
              Ignoring a process that is known to have a strong influence on the
              area under study.
            </li>
          </ul>
          <p>
            If experimental design features prominently in the paper, first
            check that the methodology is sound - if not, this is likely to be a
            major flaw.
          </p>
        </div>
        <h3>You Might Examine:</h3>
        <ul className="list-disc ml-8">
          <li>The sampling in analytical papers.</li>
          <li>The sufficient use of control experiments.</li>
          <li>The precision of process data.</li>
          <li>The regularity of sampling in time-dependent studies.</li>
          <li>
            The validity of questions, the use of a detailed methodology and the
            data analysis being done systematically (in qualitative research).
          </li>
          <li>
            That qualitative research extends beyond the author's opinions, with
            sufficient descriptive elements and appropriate quotes from
            interviews or focus groups.
          </li>
        </ul>

        <h3>Major Flaws in Information</h3>
        <div>
          <p>
            If methodology is less of an issue, it's often a good idea to look
            at the data tables, figures or images first. Especially in science
            research, it's all about the information gathered. If there are
            critical flaws in this, it's very likely the manuscript will need to
            be rejected. Such issues include:
          </p>
          <ul className="list-disc ml-8">
            <li>Insufficient data.</li>
            <li>Statistically non-significant variations.</li>
            <li>Unclear data tables.</li>
            <li>
              Contradictory data that either are not self-consistent or disagree
              with the conclusions.
            </li>
            <li>
              Confirmatory data that adds little, if anything, to current
              understanding - unless strong arguments for such repetition are
              made.
            </li>
          </ul>
          <p>
            If you find a major problem, note your reasoning and clear
            supporting evidence (including citations).
          </p>
        </div>
        <h3>Concluding the First Reading</h3>
        <p>
          After the initial read and using your notes, including those of any
          major flaws you found, draft the first two paragraphs of your review -
          the first summarizing the research question addressed and the second
          the contribution of the work. If the journal has a prescribed
          reporting format, this draft will still help you compose your
          thoughts.
        </p>
        <h3>The First Paragraph</h3>
        <div>
          <p>
            This should state the main question addressed by the research and
            summarize the goals, approaches, and conclusions of the paper. It
            should:
          </p>
          <ul className="list-disc ml-8">
            <li>
              Help the editor properly contextualize the research and add weight
              to your judgement
            </li>
            <li>
              Show the author what key messages are conveyed to the reader, so
              they can be sure they are achieving what they set out to do
            </li>
            <li>
              Focus on successful aspects of the paper so the author gets a
              sense of what they've done well
            </li>
          </ul>
        </div>
        <h3>The Second Paragraph</h3>
        <div>
          <p>
            This should provide a conceptual overview of the contribution of the
            research. So consider:
          </p>
          <ul className="list-disc ml-8">
            <li>Is the paper's premise interesting and important?</li>
            <li>Are the methods used appropriate?</li>
            <li>Do the data support the conclusions?</li>
          </ul>
          After drafting these two paragraphs, you should be in a position to
          decide whether this manuscript is seriously flawed and should be
          rejected (see the next section). Or whether it is publishable in
          principle and merits a detailed, careful read through.
        </div>
        <h3>Rejection after the First Reading</h3>
        <p>
          Even if you are coming to the opinion that an article has serious
          flaws, make sure you read the whole paper. This is very important
          because you may find some really positive aspects that can be
          communicated to the author. This could help them with future
          submissions.
        </p>
        <p>
          A full read-through will also make sure that any initial concerns are
          indeed correct and fair. After all, you need the context of the whole
          paper before deciding to reject. If you still intend to recommend
          rejection, see the section "When recommending rejection."
        </p>
        <h3>Before Starting the Second Read-Through</h3>
        <p>
          Once the paper has passed your first read and you've decided the
          article is publishable in principle, one purpose of the second,
          detailed read-through is to help prepare the manuscript for
          publication. Of course, you may still decide to reject it following a
          second reading.
        </p>
        <p>
          The benchmark for acceptance is whether the manuscript makes a useful
          contribution to the knowledge base or understanding of the subject
          matter. It need not be fully complete research - it may be an interim
          paper. After all research is an incomplete, on-going project by its
          nature. The detailed read-through should take no more than an hour for
          the moderately experienced reviewer.
        </p>
        <h3>Preparation</h3>
        <div>
          <p>To save time and simplify the review:</p>
          <ul className="list-disc ml-8">
            <li>
              Don't rely solely upon inserting comments on the manuscript
              document - make separate notes
            </li>
            <li>Try to group similar concerns or praise together</li>
            <li>
              If using a review program to note directly onto the manuscript,
              still try grouping the concerns and praise in separate notes - it
              helps later
            </li>
            <li>
              Note line numbers of text upon which your notes are based - this
              helps you find items again and also aids those reading your review
            </li>
            <li>
              Keep images, graphs and data tables in clear view - either print
              them off or have them in view on a second computer monitor or
              window
            </li>
          </ul>
          <p>
            Now that you have completed your preparations, you're ready to spend
            an hour or so reading carefully through the manuscript.
          </p>
        </div>
        <h3>Doing the Second Read-Through</h3>
        <div>
          <p>
            As you're reading through the manuscript for a second time, you'll
            need to keep in mind the argument's construction, the clarity of the
            language and content. With regard to the argument’s construction,
            you should identify:
          </p>
          <ul className="list-disc ml-8">
            <li>Any places where the meaning is unclear or ambiguous</li>
            <li>Any factual errors</li>
            <li>Any invalid arguments</li>
          </ul>
          <p>You may also wish to consider:</p>
          <ul className="list-disc ml-8">
            <li>Does the title properly reflect the subject of the paper?</li>
            <li>
              Does the abstract provide an accessible summary of the paper?
            </li>
            <li>Do the keywords accurately reflect the content?</li>
            <li>Is the paper an appropriate length?</li>
            <li>Are the key messages short, accurate and clear?</li>
          </ul>
        </div>
        <h3>Check the Language</h3>
        <p>
          Not every submission is well written. Part of your role is to make
          sure that the text’s meaning is clear.
        </p>
        <div>
          <p>
            If the article is difficult to understand, you should have rejected
            it already. However, if the language is poor but you understand the
            core message, see if you can suggest improvements to fix the
            problem:
          </p>
          <ul className="list-disc ml-8">
            <li>
              Are there certain aspects that could be communicated better, such
              as parts of the discussion?
            </li>
            <li>
              Should the authors consider resubmitting to the same journal after
              language improvements?
            </li>
            <li>
              Would you consider looking at the paper again once these issues
              are dealt with?
            </li>
          </ul>
        </div>
        <h3>On Grammar and Punctuation</h3>
        <p>
          Your primary role is judging the research content. Don't spend time
          polishing grammar or spelling. Editors will make sure that the text is
          at a high standard before publication. However, if you spot
          grammatical errors that affect clarity of meaning, then it's important
          to highlight these. Expect to suggest such amendments - it's rare for
          a manuscript to pass review with no corrections. The Second
          Read-Through: Section by Section Guidance
        </p>
        <div className="ml-8 space-y-3">
          <h3>1. The Introduction </h3>
          <div>
            <p>A well-written introduction:</p>
            <ul className="list-[circle]  ml-8">
              <li>Sets out the argument.</li>
              <li>Summarizes recent research related to the topic.</li>
              <li>
                Highlights gaps in current understanding or conflicts in current
                knowledge.
              </li>
              <li>
                Establishes the originality of the research aims by
                demonstrating the need for investigations in the topic area.
              </li>
              <li>
                Gives a clear idea of the target readership, why the research
                was carried out and the novelty and topicality of the
                manuscript.
              </li>
            </ul>
          </div>
          <h3>Originality and Topicality</h3>
          <p>
            Originality and topicality can only be established in the light of
            recent authoritative research. For example, it's impossible to argue
            that there is a conflict in current understanding by referencing
            articles that are 10 years old.
          </p>
          <p>
            Authors may make the case that a topic hasn't been investigated in
            several years and that new research is required. This point is only
            valid if researchers can point to recent developments in data
            gathering techniques or to research in indirectly related fields
            that suggest the topic needs revisiting. Clearly, authors can only
            do this by referencing recent literature. Obviously, where older
            research is seminal or where aspects of the methodology rely upon
            it, then it is perfectly appropriate for authors to cite some older
            papers.
          </p>
          <p>
            Aims : It's common for the introduction to end by stating the
            research aims. By this point you should already have a good
            impression of them - if the explicit aims come as a surprise, then
            the introduction needs improvement.
          </p>
          <h3>2. Materials and Methods</h3>
          <div>
            <p>
              Academic research should be replicable, repeatable and robust -
              and follow best practice. Replicable research this makes
              sufficient use of:
            </p>
            <ul className="list-[circle]  ml-8">
              <li>Control experiments</li>
              <li>Repeated analyses</li>
              <li>Repeated experiments</li>
              <li>Sampling</li>
            </ul>
            <p>
              These are used to make sure observed trends are not due to chance
              and that the same experiment could be repeated by other
              researchers - and result in the same outcome. Statistical analyses
              will not be sound if methods are not replicable. Where research is
              not replicable, the paper should be recommended for rejection.
            </p>
          </div>
          <h3>Repeatable Methods</h3>
          <p>
            These give enough detail so that other researchers are able to carry
            out the same research. For example, equipment used or sampling
            methods should all be described in detail so that others could
            follow the same steps. Where methods are not detailed enough, it's
            usual to ask for the methods section to be revised.
          </p>
          <h3>Robust Research</h3>
          <p>
            This has enough data points to make sure the data are reliable. If
            there are insufficient data, it might be appropriate to recommend
            revision. You should also consider whether there is any in-built
            bias not nullified by the control experiments.
          </p>
          <h3>Best Practice</h3>
          <h3></h3>
          <div>
            <p>During these checks you should keep in mind best practice:</p>
            <ul className="list-[circle]  ml-8">
              <li>
                Standard guidelines were followed (e.g. the CONSORT Statement
                for reporting randomized trials)
              </li>
              <li>
                The health and safety of all participants in the study was not
                compromised
              </li>
              <li>Ethical standards were maintained</li>
            </ul>
            <p>
              If the research fails to reach relevant best practice standards,
              it's usual to recommend rejection. What's more, you don't then
              need to read any further.
            </p>
          </div>
          <h3>3. Results and Discussion</h3>
          <div>
            <p>
              This section should tell a coherent story - What happened? What
              was discovered or confirmed? Certain patterns of good reporting
              need to be followed by the author:
            </p>
            <ul className="list-[circle]  ml-8">
              <li>
                They should start by describing in simple terms what the data
                show.
              </li>
              <li>
                They should make reference to statistical analyses, such as
                significance or goodness of fit.
              </li>
              <li>
                Once described, they should evaluate the trends observed and
                explain the significance of the results to wider understanding.
                This can only be done by referencing published research.
              </li>
              <li>
                The outcome should be a critical analysis of the data collected.
              </li>
            </ul>
          </div>
          <p>
            Discussion should always, at some point, gather all the information
            together into a single whole. Authors should describe and discuss
            the overall story formed. If there are gaps or inconsistencies in
            the story, they should address these and suggest ways future
            research might confirm the findings or take the research forward.
          </p>
          <h3>4. Conclusions</h3>
          <p>
            This section is usually no more than a few paragraphs and may be
            presented as part of the results and discussion, or in a separate
            section. The conclusions should reflect upon the aims - whether they
            were achieved or not - and, just like the aims, should not be
            surprising. If the conclusions are not evidence-based, it's
            appropriate to ask for them to be re-written.
          </p>
          <h3>
            5. Information Gathered:
            <span> Images, Graphs and Data Tables</span>
          </h3>
          <div>
            <p>
              If you find yourself looking at a piece of information from which
              you cannot discern a story, then you should ask for improvements
              in presentation. This could be an issue with titles, labels,
              statistical notation or image quality. Where information is clear,
              you should check that:
            </p>
            <ul className="list-[circle]  ml-8">
              <li>
                The results seem plausible, in case there is an error in data
                gathering
              </li>
              <li>
                The trends you can see support the paper's discussion and
                conclusions
              </li>
              <li>
                There are sufficient data. For example, in studies carried out
                over time are there sufficient data points to support the trends
                described by the author?
              </li>
            </ul>
          </div>
          <p>
            You should also check whether images have been edited or manipulated
            to emphasize the story they tell. This may be appropriate but only
            if authors report on how the image has been edited (e.g. by
            highlighting certain parts of an image). Where you feel that an
            image has been edited or manipulated without explanation, you should
            highlight this in a confidential comment to the editor in your
            report.
          </p>
          <h3>6. List of References</h3>
          <p>
            You will need to check referencing for accuracy, adequacy and
            balance.
          </p>
          <h3>Accuracy</h3>
          <p>
            Where a cited article is central to the author's argument, you
            should check the accuracy and format of the reference - and bear in
            mind different subject areas may use citations differently.
            Otherwise, it's the editor’s role to exhaustively check the
            reference section for accuracy and format.
          </p>
          <h3>Adequacy</h3>
          <div>
            <p>You should consider if the referencing is adequate:</p>
            <ul className="list-[circle]  ml-8">
              <li>Are important parts of the argument poorly supported?</li>
              <li>
                Are there published studies that show similar or dissimilar
                trends that should be discussed?
              </li>
              <li>
                If a manuscript only uses half the citations typical in its
                field, this may be an indicator that referencing should be
                improved - but don't be guided solely by quantity.
              </li>
              <li>
                References should be relevant, recent and readily retrievable.
              </li>
            </ul>
          </div>
          <h3>Balance</h3>
          <div>
            <p>Check for a well-balanced list of references that is:</p>
            <ul className="list-[circle]  ml-8">
              <li>Helpful to the reader</li>
              <li>Fair to competing authors</li>
              <li>Not over-reliant on self-citation</li>
              <li>
                Gives due recognition to the initial discoveries and related
                work that led to the work under assessment
              </li>
            </ul>
          </div>
          <p>
            You should be able to evaluate whether the article meets the
            criteria for balanced referencing without looking up every
            reference.
          </p>
          <h3>7. Plagiarism</h3>
          <p>
            By now you will have a deep understanding of the paper's content -
            and you may have some concerns about plagiarism.
          </p>
          <h3>Identified Concern</h3>
          <p>
            If you find - or already knew of - a very similar paper, this may be
            because the author overlooked it in their own literature search. Or
            it may be because it is very recent or published in a journal
            slightly outside their usual field.
          </p>
          <p>
            You may feel you can advise the author how to emphasize the novel
            aspects of their own study, so as to better differentiate it from
            similar research. If so, you may ask the author to discuss their
            aims and results, or modify their conclusions, in light of the
            similar article. Of course, the research similarities may be so
            great that they render the work unoriginal and you have no choice
            but to recommend rejection.
          </p>
          <h3>Suspected Concern</h3>
          <p>
            If you suspect plagiarism, including self-plagiarism, but cannot
            recall or locate exactly what is being plagiarized, notify the
            editor of your suspicion and ask for guidance. Most editors have
            access to software that can check for plagiarism.
          </p>
          <p>
            Editors are not out to police every paper, but when plagiarism is
            discovered during peer review it can be properly addressed ahead of
            publication. If plagiarism is discovered only after publication, the
            consequences are worse for both authors and readers, because a
            retraction may be necessary. For detailed guidelines see COPE's
            Ethical guidelines for reviewers.
          </p>
          <h3>8. Search Engine Optimization (SEO)</h3>
          <p>
            After the detailed read-through, you will be in a position to advise
            whether the title, abstract and key words are optimized for search
            purposes. In order to be effective, good SEO terms will reflect the
            aims of the research.
          </p>
          <div>
            <p>
              A clear title and abstract will improve the paper's search engine
              rankings and will influence whether the user finds and then
              decides to navigate to the main article. The title should contain
              the relevant SEO terms early on. This has a major effect on the
              impact of a paper, since it helps it appear in search results. A
              poor abstract can then lose the reader's interest and undo the
              benefit of an effective title - whilst the paper's abstract may
              appear in search results, the potential reader may go no further.
              So ask yourself, while the abstract may have seemed adequate
              during earlier checks, does it:
            </p>
            <ul className="list-[circle]  ml-8">
              <li>Do justice to the manuscript in this context?</li>
              <li>Highlight important findings sufficiently?</li>
              <li>Present the most interesting data?</li>
            </ul>
          </div>
        </div>

        <h3>How to Structure Your Report</h3>
        <p>
          If there is a formal report format, remember to follow it. This will
          often comprise a range of questions followed by comment sections. Try
          to answer all the questions. They are there because the editor felt
          that they are important. If you're following an informal report format
          you could structure your report in three sections: summary, major
          issues, minor issues.
        </p>
        <h3>Summary</h3>
        <div>
          <ul className="list-disc ml-8">
            <li>
              Give positive feedback first. Authors are more likely to read your
              review if you do so. But don't overdo it if you will be
              recommending rejection{" "}
            </li>
            <li>
              Briefly summarize what the paper is about and what the findings
              are{" "}
            </li>
            <li>
              Try to put the findings of the paper into the context of the
              existing literature and current knowledge{" "}
            </li>
            <li>
              Indicate the significance of the work and if it is novel or mainly
              confirmatory{" "}
            </li>
            <li>
              Indicate the work's strengths, its quality and completeness{" "}
            </li>
            <li>
              State any major flaws or weaknesses and note any special
              considerations. For example, if previously held theories are being
              overlooked
            </li>
          </ul>
          <p>Major Issues</p>
          <ul className="list-disc ml-8">
            <li>
              Are there any major flaws? State what they are and what the
              severity of their impact is on the paper
            </li>
            <li>
              Has similar work already been published without the authors
              acknowledging this?
            </li>
            <li>
              Are the authors presenting findings that challenge current
              thinking? Is the evidence they present strong enough to prove
              their case? Have they cited all the relevant work that would
              contradict their thinking and addressed it appropriately?
            </li>
            <li>
              If major revisions are required, try to indicate clearly what they
              are
            </li>
            <li>
              Are there any major presentational problems? Are figures &amp;
              tables, language and manuscript structure all clear enough for you
              to accurately assess the work?
            </li>
            <li>
              Are there any ethical issues? If you are unsure it may be better
              to disclose these in the confidential comments section
            </li>
          </ul>
          <p>Minor Issues</p>
          <ul className="list-disc ml-8">
            <li>
              Are there places where meaning is ambiguous? How can this be
              corrected?
            </li>
            <li>
              Are the correct references cited? If not, which should be cited
              instead/also? Are citations excessive, limited, or biased?
            </li>
            <li>
              Are there any factual, numerical or unit errors? If so, what are
              they?
            </li>
            <li>
              Are all tables and figures appropriate, sufficient, and correctly
              labelled? If not, say which are not
            </li>
          </ul>
        </div>
        <h3>On Presentation and Style</h3>
        <div>
          <p>
            Your review should ultimately help the author improve their article.
            So be polite, honest and clear. You should also try to be objective
            and constructive, not subjective and destructive. You should also:
          </p>
          <ul className="list-disc ml-8">
            <li>
              Write clearly and so you can be understood by people whose first
              language is not English
            </li>
            <li>
              Avoid complex or unusual words, especially ones that would even
              confuse native speakers
            </li>
            <li>
              Number your points and refer to page and line numbers in the
              manuscript when making specific comments
            </li>
            <li>
              If you have been asked to only comment on specific parts or
              aspects of the manuscript, you should indicate clearly which these
              are
            </li>
            <li>
              Treat the author's work the way you would like your own to be
              treated
            </li>
          </ul>
        </div>
        <h3>Criticisms &amp; Confidential Comments to Editors</h3>
        <p>
          Most journals give reviewers the option to provide some confidential
          comments to editors. Often this is where editors will want reviewers
          to state their recommendation - see the next section - but otherwise
          this area is best reserved for communicating malpractice such as
          suspected plagiarism, fraud, unattributed work, unethical procedures,
          duplicate publication, bias or other conflicts of interest.
        </p>
        <p>
          However, this doesn't give reviewers permission to 'backstab' the
          author. Authors can't see this feedback and are unable to give their
          side of the story unless the editor asks them to. So in the spirit of
          fairness, write comments to editors as though authors might read them
          too.
        </p>
        <h3>The Recommendation</h3>
        <p>
          Most journals give reviewers the option to provide some confidential
          comments to editors. Often this is where editors will want reviewers
          to state their recommendation, but otherwise this area is best
          reserved for communicating malpractice such as suspected plagiarism,
          fraud, unattributed work, unethical procedures, duplicate publication,
          bias or other conflicts of interest.
        </p>
        <p>
          Reviewers should check the preferences of individual journals as to
          where they want review decisions to be stated. In particular, bear in
          mind that some journals will not want the recommendation included in
          any comments to authors, as this can cause editors difficulty later
          for more advice about working with editors.
        </p>
        <p>
          You will normally be asked to indicate your recommendation (e.g.
          accept, reject, revise and resubmit, etc.) from a fixed-choice list
          and then to enter your comments into a separate text box.
        </p>
        <h3>Recommending Acceptance</h3>
        <p>
          If you're recommending acceptance, give details outlining why, and if
          there are any areas that could be improved. Don't just give a short,
          cursory remark such as 'great, accept'.
        </p>
        <h3>Recommending Revision</h3>
        <p>
          Where improvements are needed, a recommendation for major or minor
          revision is typical. You may also choose to state whether you opt in
          or out of the post-revision review too. If recommending revision,
          state specific changes you feel need to be made. The author can then
          reply to each point in turn.
        </p>
        <p>
          Some journals offer the option to recommend rejection with the
          possibility of resubmission – this is most relevant where substantial,
          major revision is necessary.
        </p>
        <h3>Recommending Rejection</h3>
        <p>
          If recommending rejection or major revision, state this clearly in
          your review. When Recommending Rejection Where manuscripts have
          serious flaws you should not spend any time polishing the review
          you've drafted or give detailed advice on presentation.
        </p>
        <p>In your recommendations for the author, you should:</p>
        <ul className="list-disc ml-8">
          <li>
            Give constructive feedback describing ways that they could improve
            the research
          </li>
          <li>
            Keep the focus on the research and not the author. This is an
            extremely important part of your job as a reviewer
          </li>
          <li>
            Avoid making critical confidential comments to the editor while
            being polite and encouraging to the author - the latter may not
            understand why their manuscript has been rejected. Also, they won't
            get feedback on how to improve their research and it could trigger
            an appeal.
          </li>
        </ul>

        <p>
          Remember to give constructive criticism even if recommending
          rejection. This helps developing researchers improve their work and
          explains to the editor why you felt the manuscript should not be
          published.
        </p>
        <h3>Working with Editors</h3>
        <p>
          Editors rely on reviewers’ recommendations to help them decide whether
          to accept or reject an article. This section will help you understand
          exactly what it is that editors are looking for from a good peer
          review.
        </p>
        <h3>Your Expertise</h3>
        <p>
          When an editor invites you to review, they will mention if there is a
          particular aspect of the paper that they would like you to look at.
          This is because sometimes editors may invite reviewers with expertise
          in certain areas, e.g., the methodology or the statistics used in the
          study – even if they know you don’t work in the subject area of the
          manuscript. If that is the case, it’s good practice to state at the
          beginning of the review that you will only be commenting on that
          aspect of the paper. If you’re not sure why you were asked to review a
          paper, ask the editor who invited you to review. Editors prefer that
          you contact them with questions, rather than you not respond or not
          complete the review.
        </p>
        <h3>The Role of Your Recommendation</h3>
        <p>
          It’s down to the editors to make a decision about the paper. This will
          be based on your recommendation and comments, and their own reading.
          It is worth repeating that the editor’s decision will not always match
          yours, so you should not mention it in comments to the author.
        </p>
        <h3>Comments to Editors and Authors</h3>
        <p>
          The editor not only uses reviewer comments to help make a decision.
          They will often refer to them in their decision letter. With this in
          mind, it’s helpful to editors if you:
        </p>
        <ul className="list-disc ml-8">
          <li>Number your comments</li>
          <li>
            Are clear about which points are absolutely critical if the paper is
            given an opportunity for revision
          </li>
          <li>Suggest how authors can address any concerns raised</li>
        </ul>
        <p>
          Specific recommendations for correcting flaws are very welcome by
          editors and useful to authors.Remember, it’s especially important that
          your comments match your recommendation. If you’re recommending that
          the paper be rejected, your comments should clearly state what the
          problems are and they should not be excessively positive or seem to
          contradict your recommendation.
        </p>
        <p>
          It can put the editor in an awkward position if they are seen to
          disagree with your recommendation or your comments.
          <br />
          Keep in mind that comments to editors should only be used for notes
          that you don’t want the authors to see. Anything that is important for
          the authors to know should be in comments to the authors, not the
          comments to the editors.
          <br />
          Once the editor has made a decision and the author has been notified,
          you will normally receive a copy of the letter that will include any
          other reviewers’ comments.
          <br />
        </p>
      </section>
      <section id="revised-manuscripts" className="scroll-mt-30 space-y-3">
        <h3>How to Review Revised Manuscripts</h3>
        <p>
          It is uncommon for a paper to be accepted for publication without
          changes – most papers are revised at least once in light of comments
          from reviewers and editors. When a revised paper is received:
        </p>
        <ul className="list-disc ml-8">
          <li>Minor changes will usually be assessed directly by the editor</li>
          <li>
            If significant revisions were requested, the editor will usually
            return the manuscript to the original reviewers (unless they opted
            out of this)
          </li>
          <li>
            Rarely, the editor may invite comments from a new reviewer – the
            editor should explain why this fresh review is sought. It is
            important new reviewers respect previous review comments and the
            efforts the author has made to revise the paper
          </li>
        </ul>
        <p>
          Ideally, any significant changes should already have been requested in
          the original review – this subsequent review should be to ensure that
          the changes have been made, rather than for raising additional issues.
        </p>
        <p>
          Thus your review of a revised manuscript should be relatively quick
          and may only involve checking that certain requested actions have been
          done. Nevertheless, the aim of the review remains the same: to ensure
          the paper is of a publishable standard.
        </p>
        <p>
          Usually the editor will provide both the original decision letter and
          the author’s response to it. This will allow you to see what changes
          were requested – including any by the other reviewer – and how the
          author has responded to those changes.
        </p>
        <p>
          You should focus on how the author has changed the paper in light of
          their own response comments. Some journals require authors to
          highlight the changes in their revised manuscript, which simplifies
          this.
        </p>
      </section>
      <section id="clinical-manuscript" className="scroll-mt-30 space-y-3">
        <h3>For Reviewing a Clinical Manuscript</h3>
        <h4>1. Follow the basic principles of peer review</h4>
        <p>
          The basic tenets of peer review apply to all types of manuscripts,
          even those with a professional or practitioner target audience.
        </p>
        <h4>2. Keep the target audience in mind</h4>
        <p>
          A clinically focused manuscript should supply the latest research to
          make sound decisions for practice. As you read, check to see if the
          author(s) is looking at a clinical problem, rather than a research
          question, and assess the tone to see if it is straightforward and
          speaks to the clinician.
        </p>
        <p>
          You should also consider if the manuscript has citations to recent,
          relevant studies and diagrams or tables useful for clinical
          situations. Lastly, judge whether or not the discussion uses the
          findings to lead to a new understanding of clinical problems and/or
          therapies.
        </p>
        <h4>3. Look for a well-organized structure</h4>
        <p>
          Clinical practitioners are busy and the research they read needs to be
          organized. When you are reviewing the manuscript think about how
          appealing it is. Do you find it easy to identify the key points? Is it
          clear what areas are less important and can be skimmed over by a busy
          practitioner? Is the structure of the manuscript consistent with that
          of the journal?
        </p>
        <h4>4. Consider the application to professional practice</h4>
        <p>
          The manuscript you are reading should emphasize its potential impact
          on practice. A strong manuscript will include details on how the
          research or intervention could be implemented. An even stronger
          manuscript will also include information like clinically applicable
          screening tools and patient/consumer-friendly education sources.
        </p>
        <h4>5. Establish the elements of the case study</h4>
        <p>
          If a case study is included, only the essential elements should be
          presented. Case studies can be a useful way to introduce materials,
          but a clinician does not always have time to read a full case study.
          Look to see that the key details are presented and if other
          information has been included in figure or table format (i.e.,
          laboratory values, chronology of key events, photographs, etc.).
        </p>
        <p>
          If the case study is a real patient, the patient and his/her family
          should not be identifiable. If the manuscript does not clearly state
          if the patient is real, your review should ask for clarification.
        </p>
        <h4>6. Watch out for conflicts of interest</h4>
        <p>
          Authors must disclose any conflicts of interest (COI) in the
          manuscripts. A COI could arise if an author is paid by a commercial
          entity to write the article, do the research, or compile the review.
          If a third party, writes an article that is submitted by another
          individual (sometimes referred to as “ghostwriting”), this must also
          be stated.
          <br />A true conflict may not exist, but reviewers should be given all
          the disclosure information. If you feel that something is missing,
          tell the editor and mention it in your review. Further, if you feel
          that you have a potential conflict of interest with the manuscript,
          notify the editor immediately.
        </p>
        <h4>
          7. Confirm that human (or animal) participants were properly protected
        </h4>
        <p>
          All research must conform to the certain ethical standards that
          protect both human participants and experimental animals. The authors
          must include a statement to that effect in the manuscript, even when
          the institutional decision was to exempt the research from informed
          consent procedures. If the statement is missing, notify the editor as
          some journals will not accept research without this statement.
        </p>
      </section>
      <section id="registerd-report" className="space-y-3 scroll-mt-30">
        <h3>Reviewing Registered Reports</h3>
        <h4>Background</h4>
        <p>
          Registered Reports are a form of empirical article offered by a number
          of journals in which the methods and proposed analyses are
          pre-registered and reviewed prior to research being conducted. High
          quality protocols are then provisionally accepted for publication
          before data collection commences. This format is designed to minimize
          publication bias and research bias in hypothesis-driven research,
          while also allowing the flexibility to conduct exploratory
          (unregistered) analyses and report serendipitous findings.
        </p>
        <p>
          The review process for Registered Reports is divided into two stages.
          At Stage 1 (Study Design), reviewers assess study proposals before
          data are collected. At Stage 2 (Completed Study), reviewers consider
          the full study, including results and interpretation.
        </p>
        <h4>Guidelines for Reviewers</h4>
        <p>
          Stage 1 manuscripts will include only an Introduction, Methods
          (including proposed analyses), and Pilot Data (where applicable). In
          considering papers at Stage 1, reviewers will be asked to assess:
        </p>
        <ul className="ml-8">
          1. The importance of the research question(s), for journals that
          normally include this as a criterion for acceptance.
          <br />
          2. The logic, rationale, and plausibility of the proposed hypotheses.
          <br />
          3. The soundness and feasibility of the methodology and analysis
          pipeline (including statistical power analysis where appropriate).
          <br />
          4. Whether the clarity and degree of methodological detail is
          sufficient to exactly replicate the proposed experimental procedures
          and analysis pipeline.
          <br />
          5. Whether the authors have pre-specified sufficient outcome-neutral
          tests for ensuring that the results obtained are able to test the
          stated hypotheses, including positive controls and quality checks.
          <br />
        </ul>

        <p>
          Following completion of the study, authors will complete the
          manuscript, including Results and Discussion sections. These Stage 2:
          Completed Study manuscripts will more closely resemble a regular
          article format. The manuscript will then be returned to the reviewers,
          who will be asked to appraise:
        </p>
        <ul className="ml-8">
          <li>
            1. Whether the data are able to test the authors’ proposed
            hypotheses by satisfying the approved outcome-neutral conditions
            (such as quality checks, positive controls).
          </li>

          <li>
            2. Whether the Introduction, rationale and stated hypotheses are the
            same as the approved Stage 1 submission (required).
          </li>

          <li>
            3. Whether the authors adhered precisely to the registered
            experimental procedures.
          </li>

          <li>
            4. Whether any unregistered post hoc analyses added by the authors
            are justified, methodologically sound, and informative.
          </li>

          <li>
            5. Whether the authors’ conclusions are justified given the data.
          </li>
        </ul>
        <p>
          Reviewers at Stage 2 may suggest that authors report additional post
          hoc tests on their data; however, authors are not obliged to do so
          unless such tests are necessary to satisfy one or more of the Stage 2
          review criteria. Please note that editorial decisions will be based on
          adherence to the approved protocols and experimental design in Stage 1
          and conclusions supported by data (even if they are negative findings)
          as opposed to novelty and perceived importance of results.
        </p>
      </section>
    </section>
  );
};

export default page;
