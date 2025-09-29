const ContentAccordian = ({ data, open = false }) => {
  return (
    <div className="divide-y rounded border">
      {data.map((x, i) => (
        <details key={i} className="group" open={open}>
          <summary className="flex cursor-pointer list-none items-center justify-between font-bold py-6 px-4">
            <h4>{x?.t}</h4>
            <span className="transition-transform group-open:rotate-45">
              ＋
            </span>
          </summary>

          <div className="mt-2 bg-[#eee] p-2">
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
