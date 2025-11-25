const ContentAccordian = ({ data = [], open = false }) => {
  if (!data || data.length === 0) {
    return (
      <div className="rounded border p-4 text-center text-gray-500 italic">
        No data available.
      </div>
    );
  }

  return (
    <div className="divide-y rounded border">
      {data.map((x, i) => (
        <details key={i} className="group" open={open}>
          <summary className="flex cursor-pointer list-none items-center justify-between font-bold py-3 px-4">
            <h4>{x?.t}</h4>
            <span className="transition-transform group-open:rotate-45">
              ＋
            </span>
          </summary>

          <div className="mt-2 bg-[#eee] p-2">
            {x?.c && x.c.length > 0 ? (
              x.c.map((c, j) => (
                <div key={j} className="mb-3">
                  {typeof c === "string" ? (
                    <div dangerouslySetInnerHTML={{ __html: c }} />
                  ) : (
                    c
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">
                No data available for {x?.t}.
              </p>
            )}
          </div>
        </details>
      ))}
    </div>
  );
};

export default ContentAccordian;
