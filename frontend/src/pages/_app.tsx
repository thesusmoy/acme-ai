import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Layout>
            <Head>
                <title>LegalSearch</title>
                <meta
                    name="description"
                    content="AI-powered legal research assistant for intelligent document search and analysis"
                />
            </Head>
            <Component {...pageProps} />
        </Layout>
    );
}
