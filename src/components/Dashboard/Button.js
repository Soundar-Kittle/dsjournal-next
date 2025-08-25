import { cn } from "@/lib/utils"

export default function Button({className}) {
    const handleSubmit = () =>{
        console.log("Welcome to shadecn");
    }
  return (
    <button onClick={handleSubmit()} className={cn("bg-blue-500 text-white px-4 py-2 cursor-pointer", className)}>Test</button>
  )
}
