import React from 'react';
import Link from 'next/link';

const Hero = () => {
  return (
    <div>
        Hero
        <Link href="/">Home</Link>
        <Link href="/admin">Admin</Link>
        <Link href="/dashboard">Dashboard</Link>
    </div>
  )
}

export default Hero