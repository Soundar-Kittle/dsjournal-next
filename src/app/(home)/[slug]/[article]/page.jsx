export default async function Page({ params }) {
  const param = await params;
  let article = param.article;
  return <div>Article {article}</div>;
}
