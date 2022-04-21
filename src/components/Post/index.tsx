import { FiCalendar, FiUser } from 'react-icons/fi';

export function Post(): JSX.Element {
  return (
    <article>
      <h2>Como utilizar Hooks</h2>

      <h4>Pensando em sincronização em vez de ciclos de vida.</h4>

      <div className="post-info">
        <span>
          <FiCalendar />
          15 Mar 2021
        </span>

        <span>
          <FiUser />
          Joseph Oliveira
        </span>
      </div>
    </article>
  );
}
