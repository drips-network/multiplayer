import { BadRequestError } from './errors';

export function parseGitHubUrl(url: string): {
  username: string;
  repoName: string;
} {
  const githubUrlRegex = /^https:\/\/github\.com\/([\w-]+)\/([\w.-]+)$/;
  const match = url.match(githubUrlRegex);

  if (match) {
    return {
      username: match[1],
      repoName: match[2],
    };
  }

  throw new BadRequestError(`Invalid GitHub URL.`);
}

export function isValidHttpsUrl(url: string) {
  const pattern = /^https:\/\/[^\s$.?#].[^\s]*$/;
  return pattern.test(url);
}

export const nowInMillis = () => new Date().getTime();
