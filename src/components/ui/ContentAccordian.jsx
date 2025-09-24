// const ContentAccordian = ({ data }) => {
//   return (
//     <div className="divide-y rounded-md border mt-5">
//       {data.map((x, i) => (
//         <details key={i} className="group">
//           <summary className="flex cursor-pointer list-none items-center justify-between font-bold py-6 px-4">
//             <span>{x?.t}</span>
//             <span className="transition-transform group-open:rotate-45">
//               ＋
//             </span>
//           </summary>
//           <div className="mt-2 bg-[#eee] p-2 text-justify">
//             {x?.c?.map((c, j) => (
//               <p key={j} className="block mb-3">
//                 {c}
//               </p>
//             ))}
//           </div>
//         </details>
//       ))}
//     </div>
//   );
// };

// export default ContentAccordian;

const ContentAccordian = ({ data }) => {
  return (
    <div className="divide-y rounded-md border mt-5">
      {data.map((x, i) => (
        <details key={i} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between font-bold py-6 px-4">
            <span>{x?.t}</span>
            <span className="transition-transform group-open:rotate-45">
              ＋
            </span>
          </summary>

          <div className="mt-2 bg-[#eee] p-2 text-justify">
            {x?.c?.map((c, j) => (
              <div
                key={j}
                className="mb-3"
                dangerouslySetInnerHTML={{ __html: c }}
              />
            ))}
          </div>
        </details>
      ))}
    </div>
  );
};

export default ContentAccordian;
