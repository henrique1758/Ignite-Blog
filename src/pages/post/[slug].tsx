/* eslint-disable react/no-danger */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import common from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const formattedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  const totalWords = post.data.content.reduce((total, contentItem) => {
    const headingWords = contentItem.heading.split(' ').length;
    const bodyWords = contentItem.body.map(item => item.text.split(' ').length);

    bodyWords.map(word => (total += word + headingWords));

    return total;
  }, 0);

  const estimatedReadingTime = Math.ceil(totalWords / 200);

  return (
    <>
      <Head>
        <title>Spacetraveling | {post.data.title}</title>
      </Head>

      <article>
        <Header />

        <img
          src={post.data.banner.url}
          alt="banner"
          className={styles.banner}
        />

        <div className={common.container}>
          <div className={styles.content}>
            <h1>{post.data.title}</h1>

            <div className={styles.postInfo}>
              <span>
                <FiCalendar />
                {formattedDate}
              </span>

              <span>
                <FiUser />
                {post.data.author}
              </span>

              <span>
                <FiClock /> {estimatedReadingTime} min
              </span>
            </div>

            {post.data.content.map(content => {
              return (
                <section key={content.heading} className={styles.postSection}>
                  <h2>{content.heading}</h2>

                  <div
                    className={styles.postContent}
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content.body),
                    }}
                  />
                </section>
              );
            })}
          </div>
        </div>
      </article>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post', {});

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { slug } = params;
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  // eslint-disable-next-line no-console
  console.log(post);

  return {
    props: {
      post,
    },
  };
};
