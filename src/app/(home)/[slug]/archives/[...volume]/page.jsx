export default async function Page({ params }) {
  const param = await params;
  let volume = param.volume;
  return <div>Volume {volume}</div>;
}
