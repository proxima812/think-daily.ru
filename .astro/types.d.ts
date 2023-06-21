declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';
	export type CollectionEntry<C extends keyof AnyEntryMap> = AnyEntryMap[C][keyof AnyEntryMap[C]];

	// TODO: Remove this when having this fallback is no longer relevant. 2.3? 3.0? - erika, 2023-04-04
	/**
	 * @deprecated
	 * `astro:content` no longer provide `image()`.
	 *
	 * Please use it through `schema`, like such:
	 * ```ts
	 * import { defineCollection, z } from "astro:content";
	 *
	 * defineCollection({
	 *   schema: ({ image }) =>
	 *     z.object({
	 *       image: image(),
	 *     }),
	 * });
	 * ```
	 */
	export const image: never;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<
				import('astro/zod').AnyZodObject,
				import('astro/zod').AnyZodObject
		  >;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {})
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {})
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"aa": {
"april/daily_01-04.md": {
	id: "april/daily_01-04.md";
  slug: "april/daily_01-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_02-04.md": {
	id: "april/daily_02-04.md";
  slug: "april/daily_02-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_03-04.md": {
	id: "april/daily_03-04.md";
  slug: "april/daily_03-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_04-04.md": {
	id: "april/daily_04-04.md";
  slug: "april/daily_04-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_05-04.md": {
	id: "april/daily_05-04.md";
  slug: "april/daily_05-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_06-04.md": {
	id: "april/daily_06-04.md";
  slug: "april/daily_06-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_07-04.md": {
	id: "april/daily_07-04.md";
  slug: "april/daily_07-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_08-04.md": {
	id: "april/daily_08-04.md";
  slug: "april/daily_08-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_09-04.md": {
	id: "april/daily_09-04.md";
  slug: "april/daily_09-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_10-04.md": {
	id: "april/daily_10-04.md";
  slug: "april/daily_10-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_11-04.md": {
	id: "april/daily_11-04.md";
  slug: "april/daily_11-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_12-04.md": {
	id: "april/daily_12-04.md";
  slug: "april/daily_12-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_13-04.md": {
	id: "april/daily_13-04.md";
  slug: "april/daily_13-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_14-04.md": {
	id: "april/daily_14-04.md";
  slug: "april/daily_14-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_15-04.md": {
	id: "april/daily_15-04.md";
  slug: "april/daily_15-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_16-04.md": {
	id: "april/daily_16-04.md";
  slug: "april/daily_16-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_17-04.md": {
	id: "april/daily_17-04.md";
  slug: "april/daily_17-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_18-04.md": {
	id: "april/daily_18-04.md";
  slug: "april/daily_18-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_19-04.md": {
	id: "april/daily_19-04.md";
  slug: "april/daily_19-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_20-04.md": {
	id: "april/daily_20-04.md";
  slug: "april/daily_20-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_21-04.md": {
	id: "april/daily_21-04.md";
  slug: "april/daily_21-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_22-04.md": {
	id: "april/daily_22-04.md";
  slug: "april/daily_22-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_23-04.md": {
	id: "april/daily_23-04.md";
  slug: "april/daily_23-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_24-04.md": {
	id: "april/daily_24-04.md";
  slug: "april/daily_24-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_25-04.md": {
	id: "april/daily_25-04.md";
  slug: "april/daily_25-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_26-04.md": {
	id: "april/daily_26-04.md";
  slug: "april/daily_26-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_27-04.md": {
	id: "april/daily_27-04.md";
  slug: "april/daily_27-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_28-04.md": {
	id: "april/daily_28-04.md";
  slug: "april/daily_28-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_29-04.md": {
	id: "april/daily_29-04.md";
  slug: "april/daily_29-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"april/daily_30-04.md": {
	id: "april/daily_30-04.md";
  slug: "april/daily_30-04";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_01-08.md": {
	id: "avgust/daily_01-08.md";
  slug: "avgust/daily_01-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_02-08.md": {
	id: "avgust/daily_02-08.md";
  slug: "avgust/daily_02-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_03-08.md": {
	id: "avgust/daily_03-08.md";
  slug: "avgust/daily_03-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_04-08.md": {
	id: "avgust/daily_04-08.md";
  slug: "avgust/daily_04-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_05-08.md": {
	id: "avgust/daily_05-08.md";
  slug: "avgust/daily_05-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_06-08.md": {
	id: "avgust/daily_06-08.md";
  slug: "avgust/daily_06-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_07-08.md": {
	id: "avgust/daily_07-08.md";
  slug: "avgust/daily_07-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_08-08.md": {
	id: "avgust/daily_08-08.md";
  slug: "avgust/daily_08-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_09-08.md": {
	id: "avgust/daily_09-08.md";
  slug: "avgust/daily_09-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_10-08.md": {
	id: "avgust/daily_10-08.md";
  slug: "avgust/daily_10-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_11-08.md": {
	id: "avgust/daily_11-08.md";
  slug: "avgust/daily_11-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_12-08.md": {
	id: "avgust/daily_12-08.md";
  slug: "avgust/daily_12-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_13-08.md": {
	id: "avgust/daily_13-08.md";
  slug: "avgust/daily_13-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_14-08.md": {
	id: "avgust/daily_14-08.md";
  slug: "avgust/daily_14-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_15-08.md": {
	id: "avgust/daily_15-08.md";
  slug: "avgust/daily_15-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_16-08.md": {
	id: "avgust/daily_16-08.md";
  slug: "avgust/daily_16-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_17-08.md": {
	id: "avgust/daily_17-08.md";
  slug: "avgust/daily_17-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_18-08.md": {
	id: "avgust/daily_18-08.md";
  slug: "avgust/daily_18-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_19-08.md": {
	id: "avgust/daily_19-08.md";
  slug: "avgust/daily_19-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_20-08.md": {
	id: "avgust/daily_20-08.md";
  slug: "avgust/daily_20-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_21-08.md": {
	id: "avgust/daily_21-08.md";
  slug: "avgust/daily_21-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_22-08.md": {
	id: "avgust/daily_22-08.md";
  slug: "avgust/daily_22-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_23-08.md": {
	id: "avgust/daily_23-08.md";
  slug: "avgust/daily_23-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_24-08.md": {
	id: "avgust/daily_24-08.md";
  slug: "avgust/daily_24-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_25-08.md": {
	id: "avgust/daily_25-08.md";
  slug: "avgust/daily_25-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_26-08.md": {
	id: "avgust/daily_26-08.md";
  slug: "avgust/daily_26-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_27-08.md": {
	id: "avgust/daily_27-08.md";
  slug: "avgust/daily_27-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_28-08.md": {
	id: "avgust/daily_28-08.md";
  slug: "avgust/daily_28-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_29-08.md": {
	id: "avgust/daily_29-08.md";
  slug: "avgust/daily_29-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_30-08.md": {
	id: "avgust/daily_30-08.md";
  slug: "avgust/daily_30-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"avgust/daily_31-08.md": {
	id: "avgust/daily_31-08.md";
  slug: "avgust/daily_31-08";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_01-12.md": {
	id: "dekabr/daily_01-12.md";
  slug: "dekabr/daily_01-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_02-12.md": {
	id: "dekabr/daily_02-12.md";
  slug: "dekabr/daily_02-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_03-12.md": {
	id: "dekabr/daily_03-12.md";
  slug: "dekabr/daily_03-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_04-12.md": {
	id: "dekabr/daily_04-12.md";
  slug: "dekabr/daily_04-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_05-12.md": {
	id: "dekabr/daily_05-12.md";
  slug: "dekabr/daily_05-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_06-12.md": {
	id: "dekabr/daily_06-12.md";
  slug: "dekabr/daily_06-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_07-12.md": {
	id: "dekabr/daily_07-12.md";
  slug: "dekabr/daily_07-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_08-12.md": {
	id: "dekabr/daily_08-12.md";
  slug: "dekabr/daily_08-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_09-12.md": {
	id: "dekabr/daily_09-12.md";
  slug: "dekabr/daily_09-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_10-12.md": {
	id: "dekabr/daily_10-12.md";
  slug: "dekabr/daily_10-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_11-12.md": {
	id: "dekabr/daily_11-12.md";
  slug: "dekabr/daily_11-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_12-12.md": {
	id: "dekabr/daily_12-12.md";
  slug: "dekabr/daily_12-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_13-12.md": {
	id: "dekabr/daily_13-12.md";
  slug: "dekabr/daily_13-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_14-12.md": {
	id: "dekabr/daily_14-12.md";
  slug: "dekabr/daily_14-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_15-12.md": {
	id: "dekabr/daily_15-12.md";
  slug: "dekabr/daily_15-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_16-12.md": {
	id: "dekabr/daily_16-12.md";
  slug: "dekabr/daily_16-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_17-12.md": {
	id: "dekabr/daily_17-12.md";
  slug: "dekabr/daily_17-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_18-12.md": {
	id: "dekabr/daily_18-12.md";
  slug: "dekabr/daily_18-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_19-12.md": {
	id: "dekabr/daily_19-12.md";
  slug: "dekabr/daily_19-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_20-12.md": {
	id: "dekabr/daily_20-12.md";
  slug: "dekabr/daily_20-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_21-12.md": {
	id: "dekabr/daily_21-12.md";
  slug: "dekabr/daily_21-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_22-12.md": {
	id: "dekabr/daily_22-12.md";
  slug: "dekabr/daily_22-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_23-12.md": {
	id: "dekabr/daily_23-12.md";
  slug: "dekabr/daily_23-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_24-12.md": {
	id: "dekabr/daily_24-12.md";
  slug: "dekabr/daily_24-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_25-12.md": {
	id: "dekabr/daily_25-12.md";
  slug: "dekabr/daily_25-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_26-12.md": {
	id: "dekabr/daily_26-12.md";
  slug: "dekabr/daily_26-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_27-12.md": {
	id: "dekabr/daily_27-12.md";
  slug: "dekabr/daily_27-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_28-12.md": {
	id: "dekabr/daily_28-12.md";
  slug: "dekabr/daily_28-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_29-12.md": {
	id: "dekabr/daily_29-12.md";
  slug: "dekabr/daily_29-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_30-12.md": {
	id: "dekabr/daily_30-12.md";
  slug: "dekabr/daily_30-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"dekabr/daily_31-12.md": {
	id: "dekabr/daily_31-12.md";
  slug: "dekabr/daily_31-12";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_01-02.md": {
	id: "fevral/daily_01-02.md";
  slug: "fevral/daily_01-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_02-02.md": {
	id: "fevral/daily_02-02.md";
  slug: "fevral/daily_02-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_03-02.md": {
	id: "fevral/daily_03-02.md";
  slug: "fevral/daily_03-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_04-02.md": {
	id: "fevral/daily_04-02.md";
  slug: "fevral/daily_04-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_05-02.md": {
	id: "fevral/daily_05-02.md";
  slug: "fevral/daily_05-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_06-02.md": {
	id: "fevral/daily_06-02.md";
  slug: "fevral/daily_06-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_07-02.md": {
	id: "fevral/daily_07-02.md";
  slug: "fevral/daily_07-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_08-02.md": {
	id: "fevral/daily_08-02.md";
  slug: "fevral/daily_08-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_09-02.md": {
	id: "fevral/daily_09-02.md";
  slug: "fevral/daily_09-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_10-02.md": {
	id: "fevral/daily_10-02.md";
  slug: "fevral/daily_10-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_11-02.md": {
	id: "fevral/daily_11-02.md";
  slug: "fevral/daily_11-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_12-02.md": {
	id: "fevral/daily_12-02.md";
  slug: "fevral/daily_12-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_13-02.md": {
	id: "fevral/daily_13-02.md";
  slug: "fevral/daily_13-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_14-02.md": {
	id: "fevral/daily_14-02.md";
  slug: "fevral/daily_14-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_15-02.md": {
	id: "fevral/daily_15-02.md";
  slug: "fevral/daily_15-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_16-02.md": {
	id: "fevral/daily_16-02.md";
  slug: "fevral/daily_16-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_17-02.md": {
	id: "fevral/daily_17-02.md";
  slug: "fevral/daily_17-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_18-02.md": {
	id: "fevral/daily_18-02.md";
  slug: "fevral/daily_18-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_19-02.md": {
	id: "fevral/daily_19-02.md";
  slug: "fevral/daily_19-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_20-02.md": {
	id: "fevral/daily_20-02.md";
  slug: "fevral/daily_20-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_21-02.md": {
	id: "fevral/daily_21-02.md";
  slug: "fevral/daily_21-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_22-02.md": {
	id: "fevral/daily_22-02.md";
  slug: "fevral/daily_22-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_23-02.md": {
	id: "fevral/daily_23-02.md";
  slug: "fevral/daily_23-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_24-02.md": {
	id: "fevral/daily_24-02.md";
  slug: "fevral/daily_24-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_25-02.md": {
	id: "fevral/daily_25-02.md";
  slug: "fevral/daily_25-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_26-02.md": {
	id: "fevral/daily_26-02.md";
  slug: "fevral/daily_26-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_27-02.md": {
	id: "fevral/daily_27-02.md";
  slug: "fevral/daily_27-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_28-02.md": {
	id: "fevral/daily_28-02.md";
  slug: "fevral/daily_28-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"fevral/daily_29-02.md": {
	id: "fevral/daily_29-02.md";
  slug: "fevral/daily_29-02";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_01-07.md": {
	id: "iyul/daily_01-07.md";
  slug: "iyul/daily_01-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_02-07.md": {
	id: "iyul/daily_02-07.md";
  slug: "iyul/daily_02-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_03-07.md": {
	id: "iyul/daily_03-07.md";
  slug: "iyul/daily_03-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_04-07.md": {
	id: "iyul/daily_04-07.md";
  slug: "iyul/daily_04-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_05-07.md": {
	id: "iyul/daily_05-07.md";
  slug: "iyul/daily_05-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_06-07.md": {
	id: "iyul/daily_06-07.md";
  slug: "iyul/daily_06-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_07-07.md": {
	id: "iyul/daily_07-07.md";
  slug: "iyul/daily_07-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_08-07.md": {
	id: "iyul/daily_08-07.md";
  slug: "iyul/daily_08-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_09-07.md": {
	id: "iyul/daily_09-07.md";
  slug: "iyul/daily_09-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_10-07.md": {
	id: "iyul/daily_10-07.md";
  slug: "iyul/daily_10-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_11-07.md": {
	id: "iyul/daily_11-07.md";
  slug: "iyul/daily_11-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_12-07.md": {
	id: "iyul/daily_12-07.md";
  slug: "iyul/daily_12-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_13-07.md": {
	id: "iyul/daily_13-07.md";
  slug: "iyul/daily_13-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_14-07.md": {
	id: "iyul/daily_14-07.md";
  slug: "iyul/daily_14-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_15-07.md": {
	id: "iyul/daily_15-07.md";
  slug: "iyul/daily_15-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_16-07.md": {
	id: "iyul/daily_16-07.md";
  slug: "iyul/daily_16-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_17-07.md": {
	id: "iyul/daily_17-07.md";
  slug: "iyul/daily_17-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_18-07.md": {
	id: "iyul/daily_18-07.md";
  slug: "iyul/daily_18-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_19-07.md": {
	id: "iyul/daily_19-07.md";
  slug: "iyul/daily_19-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_20-07.md": {
	id: "iyul/daily_20-07.md";
  slug: "iyul/daily_20-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_21-07.md": {
	id: "iyul/daily_21-07.md";
  slug: "iyul/daily_21-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_22-07.md": {
	id: "iyul/daily_22-07.md";
  slug: "iyul/daily_22-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_23-07.md": {
	id: "iyul/daily_23-07.md";
  slug: "iyul/daily_23-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_24-07.md": {
	id: "iyul/daily_24-07.md";
  slug: "iyul/daily_24-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_25-07.md": {
	id: "iyul/daily_25-07.md";
  slug: "iyul/daily_25-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_26-07.md": {
	id: "iyul/daily_26-07.md";
  slug: "iyul/daily_26-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_27-07.md": {
	id: "iyul/daily_27-07.md";
  slug: "iyul/daily_27-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_28-07.md": {
	id: "iyul/daily_28-07.md";
  slug: "iyul/daily_28-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_29-07.md": {
	id: "iyul/daily_29-07.md";
  slug: "iyul/daily_29-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_30-07.md": {
	id: "iyul/daily_30-07.md";
  slug: "iyul/daily_30-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyul/daily_31-07.md": {
	id: "iyul/daily_31-07.md";
  slug: "iyul/daily_31-07";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_01-06.md": {
	id: "iyun/daily_01-06.md";
  slug: "iyun/daily_01-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_02-06.md": {
	id: "iyun/daily_02-06.md";
  slug: "iyun/daily_02-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_03-06.md": {
	id: "iyun/daily_03-06.md";
  slug: "iyun/daily_03-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_04-06.md": {
	id: "iyun/daily_04-06.md";
  slug: "iyun/daily_04-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_05-06.md": {
	id: "iyun/daily_05-06.md";
  slug: "iyun/daily_05-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_06-06.md": {
	id: "iyun/daily_06-06.md";
  slug: "iyun/daily_06-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_07-06.md": {
	id: "iyun/daily_07-06.md";
  slug: "iyun/daily_07-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_08-06.md": {
	id: "iyun/daily_08-06.md";
  slug: "iyun/daily_08-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_09-06.md": {
	id: "iyun/daily_09-06.md";
  slug: "iyun/daily_09-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_10-06.md": {
	id: "iyun/daily_10-06.md";
  slug: "iyun/daily_10-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_11-06.md": {
	id: "iyun/daily_11-06.md";
  slug: "iyun/daily_11-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_12-06.md": {
	id: "iyun/daily_12-06.md";
  slug: "iyun/daily_12-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_13-06.md": {
	id: "iyun/daily_13-06.md";
  slug: "iyun/daily_13-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_14-06.md": {
	id: "iyun/daily_14-06.md";
  slug: "iyun/daily_14-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_15-06.md": {
	id: "iyun/daily_15-06.md";
  slug: "iyun/daily_15-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_16-06.md": {
	id: "iyun/daily_16-06.md";
  slug: "iyun/daily_16-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_17-06.md": {
	id: "iyun/daily_17-06.md";
  slug: "iyun/daily_17-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_18-06.md": {
	id: "iyun/daily_18-06.md";
  slug: "iyun/daily_18-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_19-06.md": {
	id: "iyun/daily_19-06.md";
  slug: "iyun/daily_19-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_20-06.md": {
	id: "iyun/daily_20-06.md";
  slug: "iyun/daily_20-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_21-06.md": {
	id: "iyun/daily_21-06.md";
  slug: "iyun/daily_21-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_22-06.md": {
	id: "iyun/daily_22-06.md";
  slug: "iyun/daily_22-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_23-06.md": {
	id: "iyun/daily_23-06.md";
  slug: "iyun/daily_23-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_24-06.md": {
	id: "iyun/daily_24-06.md";
  slug: "iyun/daily_24-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_25-06.md": {
	id: "iyun/daily_25-06.md";
  slug: "iyun/daily_25-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_26-06.md": {
	id: "iyun/daily_26-06.md";
  slug: "iyun/daily_26-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_27-06.md": {
	id: "iyun/daily_27-06.md";
  slug: "iyun/daily_27-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_28-06.md": {
	id: "iyun/daily_28-06.md";
  slug: "iyun/daily_28-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_29-06.md": {
	id: "iyun/daily_29-06.md";
  slug: "iyun/daily_29-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"iyun/daily_30-06.md": {
	id: "iyun/daily_30-06.md";
  slug: "iyun/daily_30-06";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_01-05.md": {
	id: "maj/daily_01-05.md";
  slug: "maj/daily_01-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_02-05.md": {
	id: "maj/daily_02-05.md";
  slug: "maj/daily_02-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_03-05.md": {
	id: "maj/daily_03-05.md";
  slug: "maj/daily_03-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_04-05.md": {
	id: "maj/daily_04-05.md";
  slug: "maj/daily_04-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_05-05.md": {
	id: "maj/daily_05-05.md";
  slug: "maj/daily_05-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_06-05.md": {
	id: "maj/daily_06-05.md";
  slug: "maj/daily_06-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_07-05.md": {
	id: "maj/daily_07-05.md";
  slug: "maj/daily_07-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_08-05.md": {
	id: "maj/daily_08-05.md";
  slug: "maj/daily_08-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_09-05.md": {
	id: "maj/daily_09-05.md";
  slug: "maj/daily_09-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_10-05.md": {
	id: "maj/daily_10-05.md";
  slug: "maj/daily_10-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_11-05.md": {
	id: "maj/daily_11-05.md";
  slug: "maj/daily_11-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_12-05.md": {
	id: "maj/daily_12-05.md";
  slug: "maj/daily_12-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_13-05.md": {
	id: "maj/daily_13-05.md";
  slug: "maj/daily_13-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_14-05.md": {
	id: "maj/daily_14-05.md";
  slug: "maj/daily_14-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_15-05.md": {
	id: "maj/daily_15-05.md";
  slug: "maj/daily_15-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_16-05.md": {
	id: "maj/daily_16-05.md";
  slug: "maj/daily_16-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_17-05.md": {
	id: "maj/daily_17-05.md";
  slug: "maj/daily_17-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_18-05.md": {
	id: "maj/daily_18-05.md";
  slug: "maj/daily_18-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_19-05.md": {
	id: "maj/daily_19-05.md";
  slug: "maj/daily_19-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_20-05.md": {
	id: "maj/daily_20-05.md";
  slug: "maj/daily_20-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_21-05.md": {
	id: "maj/daily_21-05.md";
  slug: "maj/daily_21-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_22-05.md": {
	id: "maj/daily_22-05.md";
  slug: "maj/daily_22-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_23-05.md": {
	id: "maj/daily_23-05.md";
  slug: "maj/daily_23-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_24-05.md": {
	id: "maj/daily_24-05.md";
  slug: "maj/daily_24-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_25-05.md": {
	id: "maj/daily_25-05.md";
  slug: "maj/daily_25-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_26-05.md": {
	id: "maj/daily_26-05.md";
  slug: "maj/daily_26-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_27-05.md": {
	id: "maj/daily_27-05.md";
  slug: "maj/daily_27-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_28-05.md": {
	id: "maj/daily_28-05.md";
  slug: "maj/daily_28-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_29-05.md": {
	id: "maj/daily_29-05.md";
  slug: "maj/daily_29-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_30-05.md": {
	id: "maj/daily_30-05.md";
  slug: "maj/daily_30-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"maj/daily_31-05.md": {
	id: "maj/daily_31-05.md";
  slug: "maj/daily_31-05";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_01-03.md": {
	id: "mart/daily_01-03.md";
  slug: "mart/daily_01-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_02-03.md": {
	id: "mart/daily_02-03.md";
  slug: "mart/daily_02-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_03-03.md": {
	id: "mart/daily_03-03.md";
  slug: "mart/daily_03-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_04-03.md": {
	id: "mart/daily_04-03.md";
  slug: "mart/daily_04-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_05-03.md": {
	id: "mart/daily_05-03.md";
  slug: "mart/daily_05-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_06-03.md": {
	id: "mart/daily_06-03.md";
  slug: "mart/daily_06-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_07-03.md": {
	id: "mart/daily_07-03.md";
  slug: "mart/daily_07-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_08-03.md": {
	id: "mart/daily_08-03.md";
  slug: "mart/daily_08-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_09-03.md": {
	id: "mart/daily_09-03.md";
  slug: "mart/daily_09-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_10-03.md": {
	id: "mart/daily_10-03.md";
  slug: "mart/daily_10-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_11-03.md": {
	id: "mart/daily_11-03.md";
  slug: "mart/daily_11-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_12-03.md": {
	id: "mart/daily_12-03.md";
  slug: "mart/daily_12-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_13-03.md": {
	id: "mart/daily_13-03.md";
  slug: "mart/daily_13-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_14-03.md": {
	id: "mart/daily_14-03.md";
  slug: "mart/daily_14-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_15-03.md": {
	id: "mart/daily_15-03.md";
  slug: "mart/daily_15-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_16-03.md": {
	id: "mart/daily_16-03.md";
  slug: "mart/daily_16-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_17-03.md": {
	id: "mart/daily_17-03.md";
  slug: "mart/daily_17-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_18-03.md": {
	id: "mart/daily_18-03.md";
  slug: "mart/daily_18-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_19-03.md": {
	id: "mart/daily_19-03.md";
  slug: "mart/daily_19-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_20-03.md": {
	id: "mart/daily_20-03.md";
  slug: "mart/daily_20-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_21-03.md": {
	id: "mart/daily_21-03.md";
  slug: "mart/daily_21-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_22-03.md": {
	id: "mart/daily_22-03.md";
  slug: "mart/daily_22-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_23-03.md": {
	id: "mart/daily_23-03.md";
  slug: "mart/daily_23-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_24-03.md": {
	id: "mart/daily_24-03.md";
  slug: "mart/daily_24-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_25-03.md": {
	id: "mart/daily_25-03.md";
  slug: "mart/daily_25-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_26-03.md": {
	id: "mart/daily_26-03.md";
  slug: "mart/daily_26-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_27-03.md": {
	id: "mart/daily_27-03.md";
  slug: "mart/daily_27-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_28-03.md": {
	id: "mart/daily_28-03.md";
  slug: "mart/daily_28-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_29-03.md": {
	id: "mart/daily_29-03.md";
  slug: "mart/daily_29-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_30-03.md": {
	id: "mart/daily_30-03.md";
  slug: "mart/daily_30-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"mart/daily_31-03.md": {
	id: "mart/daily_31-03.md";
  slug: "mart/daily_31-03";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_01-11.md": {
	id: "noyabr/daily_01-11.md";
  slug: "noyabr/daily_01-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_02-11.md": {
	id: "noyabr/daily_02-11.md";
  slug: "noyabr/daily_02-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_03-11.md": {
	id: "noyabr/daily_03-11.md";
  slug: "noyabr/daily_03-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_04-11.md": {
	id: "noyabr/daily_04-11.md";
  slug: "noyabr/daily_04-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_05-11.md": {
	id: "noyabr/daily_05-11.md";
  slug: "noyabr/daily_05-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_06-11.md": {
	id: "noyabr/daily_06-11.md";
  slug: "noyabr/daily_06-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_07-11.md": {
	id: "noyabr/daily_07-11.md";
  slug: "noyabr/daily_07-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_08-11.md": {
	id: "noyabr/daily_08-11.md";
  slug: "noyabr/daily_08-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_09-11.md": {
	id: "noyabr/daily_09-11.md";
  slug: "noyabr/daily_09-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_10-11.md": {
	id: "noyabr/daily_10-11.md";
  slug: "noyabr/daily_10-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_11-11.md": {
	id: "noyabr/daily_11-11.md";
  slug: "noyabr/daily_11-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_12-11.md": {
	id: "noyabr/daily_12-11.md";
  slug: "noyabr/daily_12-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_13-11.md": {
	id: "noyabr/daily_13-11.md";
  slug: "noyabr/daily_13-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_14-11.md": {
	id: "noyabr/daily_14-11.md";
  slug: "noyabr/daily_14-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_15-11.md": {
	id: "noyabr/daily_15-11.md";
  slug: "noyabr/daily_15-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_16-11.md": {
	id: "noyabr/daily_16-11.md";
  slug: "noyabr/daily_16-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_17-11.md": {
	id: "noyabr/daily_17-11.md";
  slug: "noyabr/daily_17-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_18-11.md": {
	id: "noyabr/daily_18-11.md";
  slug: "noyabr/daily_18-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_19-11.md": {
	id: "noyabr/daily_19-11.md";
  slug: "noyabr/daily_19-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_20-11.md": {
	id: "noyabr/daily_20-11.md";
  slug: "noyabr/daily_20-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_21-11.md": {
	id: "noyabr/daily_21-11.md";
  slug: "noyabr/daily_21-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_22-11.md": {
	id: "noyabr/daily_22-11.md";
  slug: "noyabr/daily_22-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_23-11.md": {
	id: "noyabr/daily_23-11.md";
  slug: "noyabr/daily_23-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_24-11.md": {
	id: "noyabr/daily_24-11.md";
  slug: "noyabr/daily_24-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_25-11.md": {
	id: "noyabr/daily_25-11.md";
  slug: "noyabr/daily_25-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_26-11.md": {
	id: "noyabr/daily_26-11.md";
  slug: "noyabr/daily_26-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_27-11.md": {
	id: "noyabr/daily_27-11.md";
  slug: "noyabr/daily_27-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_28-11.md": {
	id: "noyabr/daily_28-11.md";
  slug: "noyabr/daily_28-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_29-11.md": {
	id: "noyabr/daily_29-11.md";
  slug: "noyabr/daily_29-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"noyabr/daily_30-11.md": {
	id: "noyabr/daily_30-11.md";
  slug: "noyabr/daily_30-11";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_01-10.md": {
	id: "oktyabr/daily_01-10.md";
  slug: "oktyabr/daily_01-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_02-10.md": {
	id: "oktyabr/daily_02-10.md";
  slug: "oktyabr/daily_02-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_03-10.md": {
	id: "oktyabr/daily_03-10.md";
  slug: "oktyabr/daily_03-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_04-10.md": {
	id: "oktyabr/daily_04-10.md";
  slug: "oktyabr/daily_04-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_05-10.md": {
	id: "oktyabr/daily_05-10.md";
  slug: "oktyabr/daily_05-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_06-10.md": {
	id: "oktyabr/daily_06-10.md";
  slug: "oktyabr/daily_06-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_07-10.md": {
	id: "oktyabr/daily_07-10.md";
  slug: "oktyabr/daily_07-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_08-10.md": {
	id: "oktyabr/daily_08-10.md";
  slug: "oktyabr/daily_08-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_09-10.md": {
	id: "oktyabr/daily_09-10.md";
  slug: "oktyabr/daily_09-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_10-10.md": {
	id: "oktyabr/daily_10-10.md";
  slug: "oktyabr/daily_10-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_11-10.md": {
	id: "oktyabr/daily_11-10.md";
  slug: "oktyabr/daily_11-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_12-10.md": {
	id: "oktyabr/daily_12-10.md";
  slug: "oktyabr/daily_12-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_13-10.md": {
	id: "oktyabr/daily_13-10.md";
  slug: "oktyabr/daily_13-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_14-10.md": {
	id: "oktyabr/daily_14-10.md";
  slug: "oktyabr/daily_14-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_15-10.md": {
	id: "oktyabr/daily_15-10.md";
  slug: "oktyabr/daily_15-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_16-10.md": {
	id: "oktyabr/daily_16-10.md";
  slug: "oktyabr/daily_16-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_17-10.md": {
	id: "oktyabr/daily_17-10.md";
  slug: "oktyabr/daily_17-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_18-10.md": {
	id: "oktyabr/daily_18-10.md";
  slug: "oktyabr/daily_18-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_19-10.md": {
	id: "oktyabr/daily_19-10.md";
  slug: "oktyabr/daily_19-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_20-10.md": {
	id: "oktyabr/daily_20-10.md";
  slug: "oktyabr/daily_20-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_21-10.md": {
	id: "oktyabr/daily_21-10.md";
  slug: "oktyabr/daily_21-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_22-10.md": {
	id: "oktyabr/daily_22-10.md";
  slug: "oktyabr/daily_22-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_23-10.md": {
	id: "oktyabr/daily_23-10.md";
  slug: "oktyabr/daily_23-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_24-10.md": {
	id: "oktyabr/daily_24-10.md";
  slug: "oktyabr/daily_24-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_25-10.md": {
	id: "oktyabr/daily_25-10.md";
  slug: "oktyabr/daily_25-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_26-10.md": {
	id: "oktyabr/daily_26-10.md";
  slug: "oktyabr/daily_26-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_27-10.md": {
	id: "oktyabr/daily_27-10.md";
  slug: "oktyabr/daily_27-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_28-10.md": {
	id: "oktyabr/daily_28-10.md";
  slug: "oktyabr/daily_28-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_29-10.md": {
	id: "oktyabr/daily_29-10.md";
  slug: "oktyabr/daily_29-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_30-10.md": {
	id: "oktyabr/daily_30-10.md";
  slug: "oktyabr/daily_30-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"oktyabr/daily_31-10.md": {
	id: "oktyabr/daily_31-10.md";
  slug: "oktyabr/daily_31-10";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_01-09.md": {
	id: "sentyabr/daily_01-09.md";
  slug: "sentyabr/daily_01-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_02-09.md": {
	id: "sentyabr/daily_02-09.md";
  slug: "sentyabr/daily_02-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_03-09.md": {
	id: "sentyabr/daily_03-09.md";
  slug: "sentyabr/daily_03-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_04-09.md": {
	id: "sentyabr/daily_04-09.md";
  slug: "sentyabr/daily_04-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_05-09.md": {
	id: "sentyabr/daily_05-09.md";
  slug: "sentyabr/daily_05-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_06-09.md": {
	id: "sentyabr/daily_06-09.md";
  slug: "sentyabr/daily_06-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_07-09.md": {
	id: "sentyabr/daily_07-09.md";
  slug: "sentyabr/daily_07-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_08-09.md": {
	id: "sentyabr/daily_08-09.md";
  slug: "sentyabr/daily_08-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_09-09.md": {
	id: "sentyabr/daily_09-09.md";
  slug: "sentyabr/daily_09-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_10-09.md": {
	id: "sentyabr/daily_10-09.md";
  slug: "sentyabr/daily_10-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_11-09.md": {
	id: "sentyabr/daily_11-09.md";
  slug: "sentyabr/daily_11-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_12-09.md": {
	id: "sentyabr/daily_12-09.md";
  slug: "sentyabr/daily_12-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_13-09.md": {
	id: "sentyabr/daily_13-09.md";
  slug: "sentyabr/daily_13-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_14-09.md": {
	id: "sentyabr/daily_14-09.md";
  slug: "sentyabr/daily_14-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_15-09.md": {
	id: "sentyabr/daily_15-09.md";
  slug: "sentyabr/daily_15-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_16-09.md": {
	id: "sentyabr/daily_16-09.md";
  slug: "sentyabr/daily_16-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_17-09.md": {
	id: "sentyabr/daily_17-09.md";
  slug: "sentyabr/daily_17-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_18-09.md": {
	id: "sentyabr/daily_18-09.md";
  slug: "sentyabr/daily_18-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_19-09.md": {
	id: "sentyabr/daily_19-09.md";
  slug: "sentyabr/daily_19-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_20-09.md": {
	id: "sentyabr/daily_20-09.md";
  slug: "sentyabr/daily_20-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_21-09.md": {
	id: "sentyabr/daily_21-09.md";
  slug: "sentyabr/daily_21-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_22-09.md": {
	id: "sentyabr/daily_22-09.md";
  slug: "sentyabr/daily_22-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_23-09.md": {
	id: "sentyabr/daily_23-09.md";
  slug: "sentyabr/daily_23-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_24-09.md": {
	id: "sentyabr/daily_24-09.md";
  slug: "sentyabr/daily_24-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_25-09.md": {
	id: "sentyabr/daily_25-09.md";
  slug: "sentyabr/daily_25-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_26-09.md": {
	id: "sentyabr/daily_26-09.md";
  slug: "sentyabr/daily_26-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_27-09.md": {
	id: "sentyabr/daily_27-09.md";
  slug: "sentyabr/daily_27-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_28-09.md": {
	id: "sentyabr/daily_28-09.md";
  slug: "sentyabr/daily_28-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_29-09.md": {
	id: "sentyabr/daily_29-09.md";
  slug: "sentyabr/daily_29-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"sentyabr/daily_30-09.md": {
	id: "sentyabr/daily_30-09.md";
  slug: "sentyabr/daily_30-09";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_01-01.md": {
	id: "yanvar copy/daily_01-01.md";
  slug: "yanvar-copy/daily_01-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_02-01.md": {
	id: "yanvar copy/daily_02-01.md";
  slug: "yanvar-copy/daily_02-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_03-01.md": {
	id: "yanvar copy/daily_03-01.md";
  slug: "yanvar-copy/daily_03-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_04-01.md": {
	id: "yanvar copy/daily_04-01.md";
  slug: "yanvar-copy/daily_04-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_05-01.md": {
	id: "yanvar copy/daily_05-01.md";
  slug: "yanvar-copy/daily_05-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_06-01.md": {
	id: "yanvar copy/daily_06-01.md";
  slug: "yanvar-copy/daily_06-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_07-01.md": {
	id: "yanvar copy/daily_07-01.md";
  slug: "yanvar-copy/daily_07-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_08-01.md": {
	id: "yanvar copy/daily_08-01.md";
  slug: "yanvar-copy/daily_08-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_09-01.md": {
	id: "yanvar copy/daily_09-01.md";
  slug: "yanvar-copy/daily_09-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_10-01.md": {
	id: "yanvar copy/daily_10-01.md";
  slug: "yanvar-copy/daily_10-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_11-01.md": {
	id: "yanvar copy/daily_11-01.md";
  slug: "yanvar-copy/daily_11-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_12-01.md": {
	id: "yanvar copy/daily_12-01.md";
  slug: "yanvar-copy/daily_12-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_13-01.md": {
	id: "yanvar copy/daily_13-01.md";
  slug: "yanvar-copy/daily_13-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_14-01.md": {
	id: "yanvar copy/daily_14-01.md";
  slug: "yanvar-copy/daily_14-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_15-01.md": {
	id: "yanvar copy/daily_15-01.md";
  slug: "yanvar-copy/daily_15-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_16-01.md": {
	id: "yanvar copy/daily_16-01.md";
  slug: "yanvar-copy/daily_16-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_17-01.md": {
	id: "yanvar copy/daily_17-01.md";
  slug: "yanvar-copy/daily_17-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_18-01.md": {
	id: "yanvar copy/daily_18-01.md";
  slug: "yanvar-copy/daily_18-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_19-01.md": {
	id: "yanvar copy/daily_19-01.md";
  slug: "yanvar-copy/daily_19-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_20-01.md": {
	id: "yanvar copy/daily_20-01.md";
  slug: "yanvar-copy/daily_20-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_21-01.md": {
	id: "yanvar copy/daily_21-01.md";
  slug: "yanvar-copy/daily_21-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_22-01.md": {
	id: "yanvar copy/daily_22-01.md";
  slug: "yanvar-copy/daily_22-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_23-01.md": {
	id: "yanvar copy/daily_23-01.md";
  slug: "yanvar-copy/daily_23-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_24-01.md": {
	id: "yanvar copy/daily_24-01.md";
  slug: "yanvar-copy/daily_24-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_25-01.md": {
	id: "yanvar copy/daily_25-01.md";
  slug: "yanvar-copy/daily_25-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_26-01.md": {
	id: "yanvar copy/daily_26-01.md";
  slug: "yanvar-copy/daily_26-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_27-01.md": {
	id: "yanvar copy/daily_27-01.md";
  slug: "yanvar-copy/daily_27-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_28-01.md": {
	id: "yanvar copy/daily_28-01.md";
  slug: "yanvar-copy/daily_28-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_29-01.md": {
	id: "yanvar copy/daily_29-01.md";
  slug: "yanvar-copy/daily_29-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_30-01.md": {
	id: "yanvar copy/daily_30-01.md";
  slug: "yanvar-copy/daily_30-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_31-01 copy.md": {
	id: "yanvar copy/daily_31-01 copy.md";
  slug: "yanvar-copy/daily_31-01-copy";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar copy/daily_31-01.md": {
	id: "yanvar copy/daily_31-01.md";
  slug: "yanvar-copy/daily_31-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_01-01.md": {
	id: "yanvar/daily_01-01.md";
  slug: "yanvar/daily_01-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_02-01.md": {
	id: "yanvar/daily_02-01.md";
  slug: "yanvar/daily_02-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_03-01.md": {
	id: "yanvar/daily_03-01.md";
  slug: "yanvar/daily_03-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_04-01.md": {
	id: "yanvar/daily_04-01.md";
  slug: "yanvar/daily_04-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_05-01.md": {
	id: "yanvar/daily_05-01.md";
  slug: "yanvar/daily_05-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_06-01.md": {
	id: "yanvar/daily_06-01.md";
  slug: "yanvar/daily_06-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_07-01.md": {
	id: "yanvar/daily_07-01.md";
  slug: "yanvar/daily_07-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_08-01.md": {
	id: "yanvar/daily_08-01.md";
  slug: "yanvar/daily_08-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_09-01.md": {
	id: "yanvar/daily_09-01.md";
  slug: "yanvar/daily_09-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_10-01.md": {
	id: "yanvar/daily_10-01.md";
  slug: "yanvar/daily_10-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_11-01.md": {
	id: "yanvar/daily_11-01.md";
  slug: "yanvar/daily_11-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_12-01.md": {
	id: "yanvar/daily_12-01.md";
  slug: "yanvar/daily_12-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_13-01.md": {
	id: "yanvar/daily_13-01.md";
  slug: "yanvar/daily_13-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_14-01.md": {
	id: "yanvar/daily_14-01.md";
  slug: "yanvar/daily_14-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_15-01.md": {
	id: "yanvar/daily_15-01.md";
  slug: "yanvar/daily_15-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_16-01.md": {
	id: "yanvar/daily_16-01.md";
  slug: "yanvar/daily_16-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_17-01.md": {
	id: "yanvar/daily_17-01.md";
  slug: "yanvar/daily_17-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_18-01.md": {
	id: "yanvar/daily_18-01.md";
  slug: "yanvar/daily_18-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_19-01.md": {
	id: "yanvar/daily_19-01.md";
  slug: "yanvar/daily_19-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_20-01.md": {
	id: "yanvar/daily_20-01.md";
  slug: "yanvar/daily_20-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_21-01.md": {
	id: "yanvar/daily_21-01.md";
  slug: "yanvar/daily_21-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_22-01.md": {
	id: "yanvar/daily_22-01.md";
  slug: "yanvar/daily_22-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_23-01.md": {
	id: "yanvar/daily_23-01.md";
  slug: "yanvar/daily_23-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_24-01.md": {
	id: "yanvar/daily_24-01.md";
  slug: "yanvar/daily_24-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_25-01.md": {
	id: "yanvar/daily_25-01.md";
  slug: "yanvar/daily_25-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_26-01.md": {
	id: "yanvar/daily_26-01.md";
  slug: "yanvar/daily_26-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_27-01.md": {
	id: "yanvar/daily_27-01.md";
  slug: "yanvar/daily_27-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_28-01.md": {
	id: "yanvar/daily_28-01.md";
  slug: "yanvar/daily_28-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_29-01.md": {
	id: "yanvar/daily_29-01.md";
  slug: "yanvar/daily_29-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_30-01.md": {
	id: "yanvar/daily_30-01.md";
  slug: "yanvar/daily_30-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
"yanvar/daily_31-01.md": {
	id: "yanvar/daily_31-01.md";
  slug: "yanvar/daily_31-01";
  body: string;
  collection: "aa";
  data: InferEntrySchema<"aa">
} & { render(): Render[".md"] };
};
"aa24hours": {
"april/daily_01-04.md": {
	id: "april/daily_01-04.md";
  slug: "april/daily_01-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_02-04.md": {
	id: "april/daily_02-04.md";
  slug: "april/daily_02-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_03-04.md": {
	id: "april/daily_03-04.md";
  slug: "april/daily_03-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_04-04.md": {
	id: "april/daily_04-04.md";
  slug: "april/daily_04-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_05-04.md": {
	id: "april/daily_05-04.md";
  slug: "april/daily_05-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_06-04.md": {
	id: "april/daily_06-04.md";
  slug: "april/daily_06-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_07-04.md": {
	id: "april/daily_07-04.md";
  slug: "april/daily_07-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_08-04.md": {
	id: "april/daily_08-04.md";
  slug: "april/daily_08-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_09-04.md": {
	id: "april/daily_09-04.md";
  slug: "april/daily_09-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_10-04.md": {
	id: "april/daily_10-04.md";
  slug: "april/daily_10-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_11-04.md": {
	id: "april/daily_11-04.md";
  slug: "april/daily_11-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_12-04.md": {
	id: "april/daily_12-04.md";
  slug: "april/daily_12-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_13-04.md": {
	id: "april/daily_13-04.md";
  slug: "april/daily_13-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_14-04.md": {
	id: "april/daily_14-04.md";
  slug: "april/daily_14-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_15-04.md": {
	id: "april/daily_15-04.md";
  slug: "april/daily_15-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_16-04.md": {
	id: "april/daily_16-04.md";
  slug: "april/daily_16-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_17-04.md": {
	id: "april/daily_17-04.md";
  slug: "april/daily_17-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_18-04.md": {
	id: "april/daily_18-04.md";
  slug: "april/daily_18-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_19-04.md": {
	id: "april/daily_19-04.md";
  slug: "april/daily_19-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_20-04.md": {
	id: "april/daily_20-04.md";
  slug: "april/daily_20-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_21-04.md": {
	id: "april/daily_21-04.md";
  slug: "april/daily_21-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_22-04.md": {
	id: "april/daily_22-04.md";
  slug: "april/daily_22-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_23-04.md": {
	id: "april/daily_23-04.md";
  slug: "april/daily_23-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_24-04.md": {
	id: "april/daily_24-04.md";
  slug: "april/daily_24-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_25-04.md": {
	id: "april/daily_25-04.md";
  slug: "april/daily_25-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_26-04.md": {
	id: "april/daily_26-04.md";
  slug: "april/daily_26-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_27-04.md": {
	id: "april/daily_27-04.md";
  slug: "april/daily_27-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_28-04.md": {
	id: "april/daily_28-04.md";
  slug: "april/daily_28-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_29-04.md": {
	id: "april/daily_29-04.md";
  slug: "april/daily_29-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"april/daily_30-04.md": {
	id: "april/daily_30-04.md";
  slug: "april/daily_30-04";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_01-08.md": {
	id: "avgust/daily_01-08.md";
  slug: "avgust/daily_01-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_02-08.md": {
	id: "avgust/daily_02-08.md";
  slug: "avgust/daily_02-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_03-08.md": {
	id: "avgust/daily_03-08.md";
  slug: "avgust/daily_03-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_04-08.md": {
	id: "avgust/daily_04-08.md";
  slug: "avgust/daily_04-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_05-08.md": {
	id: "avgust/daily_05-08.md";
  slug: "avgust/daily_05-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_06-08.md": {
	id: "avgust/daily_06-08.md";
  slug: "avgust/daily_06-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_07-08.md": {
	id: "avgust/daily_07-08.md";
  slug: "avgust/daily_07-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_08-08.md": {
	id: "avgust/daily_08-08.md";
  slug: "avgust/daily_08-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_09-08.md": {
	id: "avgust/daily_09-08.md";
  slug: "avgust/daily_09-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_10-08.md": {
	id: "avgust/daily_10-08.md";
  slug: "avgust/daily_10-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_11-08.md": {
	id: "avgust/daily_11-08.md";
  slug: "avgust/daily_11-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_12-08.md": {
	id: "avgust/daily_12-08.md";
  slug: "avgust/daily_12-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_13-08.md": {
	id: "avgust/daily_13-08.md";
  slug: "avgust/daily_13-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_14-08.md": {
	id: "avgust/daily_14-08.md";
  slug: "avgust/daily_14-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_15-08.md": {
	id: "avgust/daily_15-08.md";
  slug: "avgust/daily_15-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_16-08.md": {
	id: "avgust/daily_16-08.md";
  slug: "avgust/daily_16-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_17-08.md": {
	id: "avgust/daily_17-08.md";
  slug: "avgust/daily_17-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_18-08.md": {
	id: "avgust/daily_18-08.md";
  slug: "avgust/daily_18-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_19-08.md": {
	id: "avgust/daily_19-08.md";
  slug: "avgust/daily_19-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_20-08.md": {
	id: "avgust/daily_20-08.md";
  slug: "avgust/daily_20-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_21-08.md": {
	id: "avgust/daily_21-08.md";
  slug: "avgust/daily_21-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_22-08.md": {
	id: "avgust/daily_22-08.md";
  slug: "avgust/daily_22-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_23-08.md": {
	id: "avgust/daily_23-08.md";
  slug: "avgust/daily_23-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_24-08.md": {
	id: "avgust/daily_24-08.md";
  slug: "avgust/daily_24-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_25-08.md": {
	id: "avgust/daily_25-08.md";
  slug: "avgust/daily_25-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_26-08.md": {
	id: "avgust/daily_26-08.md";
  slug: "avgust/daily_26-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_27-08.md": {
	id: "avgust/daily_27-08.md";
  slug: "avgust/daily_27-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_28-08.md": {
	id: "avgust/daily_28-08.md";
  slug: "avgust/daily_28-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_29-08.md": {
	id: "avgust/daily_29-08.md";
  slug: "avgust/daily_29-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_30-08.md": {
	id: "avgust/daily_30-08.md";
  slug: "avgust/daily_30-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"avgust/daily_31-08.md": {
	id: "avgust/daily_31-08.md";
  slug: "avgust/daily_31-08";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_01-12.md": {
	id: "dekabr/daily_01-12.md";
  slug: "dekabr/daily_01-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_02-12.md": {
	id: "dekabr/daily_02-12.md";
  slug: "dekabr/daily_02-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_03-12.md": {
	id: "dekabr/daily_03-12.md";
  slug: "dekabr/daily_03-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_04-12.md": {
	id: "dekabr/daily_04-12.md";
  slug: "dekabr/daily_04-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_05-12.md": {
	id: "dekabr/daily_05-12.md";
  slug: "dekabr/daily_05-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_06-12.md": {
	id: "dekabr/daily_06-12.md";
  slug: "dekabr/daily_06-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_07-12.md": {
	id: "dekabr/daily_07-12.md";
  slug: "dekabr/daily_07-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_08-12.md": {
	id: "dekabr/daily_08-12.md";
  slug: "dekabr/daily_08-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_09-12.md": {
	id: "dekabr/daily_09-12.md";
  slug: "dekabr/daily_09-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_10-12.md": {
	id: "dekabr/daily_10-12.md";
  slug: "dekabr/daily_10-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_11-12.md": {
	id: "dekabr/daily_11-12.md";
  slug: "dekabr/daily_11-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_12-12.md": {
	id: "dekabr/daily_12-12.md";
  slug: "dekabr/daily_12-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_13-12.md": {
	id: "dekabr/daily_13-12.md";
  slug: "dekabr/daily_13-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_14-12.md": {
	id: "dekabr/daily_14-12.md";
  slug: "dekabr/daily_14-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_15-12.md": {
	id: "dekabr/daily_15-12.md";
  slug: "dekabr/daily_15-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_16-12.md": {
	id: "dekabr/daily_16-12.md";
  slug: "dekabr/daily_16-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_17-12.md": {
	id: "dekabr/daily_17-12.md";
  slug: "dekabr/daily_17-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_18-12.md": {
	id: "dekabr/daily_18-12.md";
  slug: "dekabr/daily_18-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_19-12.md": {
	id: "dekabr/daily_19-12.md";
  slug: "dekabr/daily_19-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_20-12.md": {
	id: "dekabr/daily_20-12.md";
  slug: "dekabr/daily_20-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_21-12.md": {
	id: "dekabr/daily_21-12.md";
  slug: "dekabr/daily_21-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_22-12.md": {
	id: "dekabr/daily_22-12.md";
  slug: "dekabr/daily_22-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_23-12.md": {
	id: "dekabr/daily_23-12.md";
  slug: "dekabr/daily_23-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_24-12.md": {
	id: "dekabr/daily_24-12.md";
  slug: "dekabr/daily_24-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_25-12.md": {
	id: "dekabr/daily_25-12.md";
  slug: "dekabr/daily_25-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_26-12.md": {
	id: "dekabr/daily_26-12.md";
  slug: "dekabr/daily_26-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_27-12.md": {
	id: "dekabr/daily_27-12.md";
  slug: "dekabr/daily_27-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_28-12.md": {
	id: "dekabr/daily_28-12.md";
  slug: "dekabr/daily_28-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_29-12.md": {
	id: "dekabr/daily_29-12.md";
  slug: "dekabr/daily_29-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_30-12.md": {
	id: "dekabr/daily_30-12.md";
  slug: "dekabr/daily_30-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"dekabr/daily_31-12.md": {
	id: "dekabr/daily_31-12.md";
  slug: "dekabr/daily_31-12";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_01-02.md": {
	id: "fevral/daily_01-02.md";
  slug: "fevral/daily_01-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_02-02.md": {
	id: "fevral/daily_02-02.md";
  slug: "fevral/daily_02-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_03-02.md": {
	id: "fevral/daily_03-02.md";
  slug: "fevral/daily_03-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_04-02.md": {
	id: "fevral/daily_04-02.md";
  slug: "fevral/daily_04-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_05-02.md": {
	id: "fevral/daily_05-02.md";
  slug: "fevral/daily_05-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_06-02.md": {
	id: "fevral/daily_06-02.md";
  slug: "fevral/daily_06-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_07-02.md": {
	id: "fevral/daily_07-02.md";
  slug: "fevral/daily_07-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_08-02.md": {
	id: "fevral/daily_08-02.md";
  slug: "fevral/daily_08-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_09-02.md": {
	id: "fevral/daily_09-02.md";
  slug: "fevral/daily_09-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_10-02.md": {
	id: "fevral/daily_10-02.md";
  slug: "fevral/daily_10-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_11-02.md": {
	id: "fevral/daily_11-02.md";
  slug: "fevral/daily_11-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_12-02.md": {
	id: "fevral/daily_12-02.md";
  slug: "fevral/daily_12-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_13-02.md": {
	id: "fevral/daily_13-02.md";
  slug: "fevral/daily_13-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_14-02.md": {
	id: "fevral/daily_14-02.md";
  slug: "fevral/daily_14-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_15-02.md": {
	id: "fevral/daily_15-02.md";
  slug: "fevral/daily_15-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_16-02.md": {
	id: "fevral/daily_16-02.md";
  slug: "fevral/daily_16-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_17-02.md": {
	id: "fevral/daily_17-02.md";
  slug: "fevral/daily_17-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_18-02.md": {
	id: "fevral/daily_18-02.md";
  slug: "fevral/daily_18-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_19-02.md": {
	id: "fevral/daily_19-02.md";
  slug: "fevral/daily_19-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_20-02.md": {
	id: "fevral/daily_20-02.md";
  slug: "fevral/daily_20-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_21-02.md": {
	id: "fevral/daily_21-02.md";
  slug: "fevral/daily_21-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_22-02.md": {
	id: "fevral/daily_22-02.md";
  slug: "fevral/daily_22-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_23-02.md": {
	id: "fevral/daily_23-02.md";
  slug: "fevral/daily_23-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_24-02.md": {
	id: "fevral/daily_24-02.md";
  slug: "fevral/daily_24-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_25-02.md": {
	id: "fevral/daily_25-02.md";
  slug: "fevral/daily_25-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_26-02.md": {
	id: "fevral/daily_26-02.md";
  slug: "fevral/daily_26-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_27-02.md": {
	id: "fevral/daily_27-02.md";
  slug: "fevral/daily_27-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_28-02.md": {
	id: "fevral/daily_28-02.md";
  slug: "fevral/daily_28-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"fevral/daily_29-02.md": {
	id: "fevral/daily_29-02.md";
  slug: "fevral/daily_29-02";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_01-07.md": {
	id: "iyul/daily_01-07.md";
  slug: "iyul/daily_01-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_02-07.md": {
	id: "iyul/daily_02-07.md";
  slug: "iyul/daily_02-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_03-07.md": {
	id: "iyul/daily_03-07.md";
  slug: "iyul/daily_03-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_04-07.md": {
	id: "iyul/daily_04-07.md";
  slug: "iyul/daily_04-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_05-07.md": {
	id: "iyul/daily_05-07.md";
  slug: "iyul/daily_05-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_06-07.md": {
	id: "iyul/daily_06-07.md";
  slug: "iyul/daily_06-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_07-07.md": {
	id: "iyul/daily_07-07.md";
  slug: "iyul/daily_07-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_08-07.md": {
	id: "iyul/daily_08-07.md";
  slug: "iyul/daily_08-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_09-07.md": {
	id: "iyul/daily_09-07.md";
  slug: "iyul/daily_09-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_10-07.md": {
	id: "iyul/daily_10-07.md";
  slug: "iyul/daily_10-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_11-07.md": {
	id: "iyul/daily_11-07.md";
  slug: "iyul/daily_11-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_12-07.md": {
	id: "iyul/daily_12-07.md";
  slug: "iyul/daily_12-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_13-07.md": {
	id: "iyul/daily_13-07.md";
  slug: "iyul/daily_13-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_14-07.md": {
	id: "iyul/daily_14-07.md";
  slug: "iyul/daily_14-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_15-07.md": {
	id: "iyul/daily_15-07.md";
  slug: "iyul/daily_15-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_16-07.md": {
	id: "iyul/daily_16-07.md";
  slug: "iyul/daily_16-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_17-07.md": {
	id: "iyul/daily_17-07.md";
  slug: "iyul/daily_17-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_18-07.md": {
	id: "iyul/daily_18-07.md";
  slug: "iyul/daily_18-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_19-07.md": {
	id: "iyul/daily_19-07.md";
  slug: "iyul/daily_19-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_20-07.md": {
	id: "iyul/daily_20-07.md";
  slug: "iyul/daily_20-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_21-07.md": {
	id: "iyul/daily_21-07.md";
  slug: "iyul/daily_21-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_22-07.md": {
	id: "iyul/daily_22-07.md";
  slug: "iyul/daily_22-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_23-07.md": {
	id: "iyul/daily_23-07.md";
  slug: "iyul/daily_23-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_24-07.md": {
	id: "iyul/daily_24-07.md";
  slug: "iyul/daily_24-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_25-07.md": {
	id: "iyul/daily_25-07.md";
  slug: "iyul/daily_25-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_26-07.md": {
	id: "iyul/daily_26-07.md";
  slug: "iyul/daily_26-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_27-07.md": {
	id: "iyul/daily_27-07.md";
  slug: "iyul/daily_27-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_28-07.md": {
	id: "iyul/daily_28-07.md";
  slug: "iyul/daily_28-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_29-07.md": {
	id: "iyul/daily_29-07.md";
  slug: "iyul/daily_29-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_30-07.md": {
	id: "iyul/daily_30-07.md";
  slug: "iyul/daily_30-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyul/daily_31-07.md": {
	id: "iyul/daily_31-07.md";
  slug: "iyul/daily_31-07";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_01-06.md": {
	id: "iyun/daily_01-06.md";
  slug: "iyun/daily_01-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_02-06.md": {
	id: "iyun/daily_02-06.md";
  slug: "iyun/daily_02-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_03-06.md": {
	id: "iyun/daily_03-06.md";
  slug: "iyun/daily_03-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_04-06.md": {
	id: "iyun/daily_04-06.md";
  slug: "iyun/daily_04-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_05-06.md": {
	id: "iyun/daily_05-06.md";
  slug: "iyun/daily_05-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_06-06.md": {
	id: "iyun/daily_06-06.md";
  slug: "iyun/daily_06-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_07-06.md": {
	id: "iyun/daily_07-06.md";
  slug: "iyun/daily_07-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_08-06.md": {
	id: "iyun/daily_08-06.md";
  slug: "iyun/daily_08-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_09-06.md": {
	id: "iyun/daily_09-06.md";
  slug: "iyun/daily_09-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_10-06.md": {
	id: "iyun/daily_10-06.md";
  slug: "iyun/daily_10-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_11-06.md": {
	id: "iyun/daily_11-06.md";
  slug: "iyun/daily_11-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_12-06.md": {
	id: "iyun/daily_12-06.md";
  slug: "iyun/daily_12-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_13-06.md": {
	id: "iyun/daily_13-06.md";
  slug: "iyun/daily_13-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_14-06.md": {
	id: "iyun/daily_14-06.md";
  slug: "iyun/daily_14-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_15-06.md": {
	id: "iyun/daily_15-06.md";
  slug: "iyun/daily_15-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_16-06.md": {
	id: "iyun/daily_16-06.md";
  slug: "iyun/daily_16-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_17-06.md": {
	id: "iyun/daily_17-06.md";
  slug: "iyun/daily_17-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_18-06.md": {
	id: "iyun/daily_18-06.md";
  slug: "iyun/daily_18-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_19-06.md": {
	id: "iyun/daily_19-06.md";
  slug: "iyun/daily_19-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_20-06.md": {
	id: "iyun/daily_20-06.md";
  slug: "iyun/daily_20-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_21-06.md": {
	id: "iyun/daily_21-06.md";
  slug: "iyun/daily_21-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_22-06.md": {
	id: "iyun/daily_22-06.md";
  slug: "iyun/daily_22-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_23-06.md": {
	id: "iyun/daily_23-06.md";
  slug: "iyun/daily_23-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_24-06.md": {
	id: "iyun/daily_24-06.md";
  slug: "iyun/daily_24-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_25-06.md": {
	id: "iyun/daily_25-06.md";
  slug: "iyun/daily_25-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_26-06.md": {
	id: "iyun/daily_26-06.md";
  slug: "iyun/daily_26-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_27-06.md": {
	id: "iyun/daily_27-06.md";
  slug: "iyun/daily_27-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_28-06.md": {
	id: "iyun/daily_28-06.md";
  slug: "iyun/daily_28-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_29-06.md": {
	id: "iyun/daily_29-06.md";
  slug: "iyun/daily_29-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"iyun/daily_30-06.md": {
	id: "iyun/daily_30-06.md";
  slug: "iyun/daily_30-06";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_01-05.md": {
	id: "maj/daily_01-05.md";
  slug: "maj/daily_01-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_02-05.md": {
	id: "maj/daily_02-05.md";
  slug: "maj/daily_02-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_03-05.md": {
	id: "maj/daily_03-05.md";
  slug: "maj/daily_03-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_04-05.md": {
	id: "maj/daily_04-05.md";
  slug: "maj/daily_04-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_05-05.md": {
	id: "maj/daily_05-05.md";
  slug: "maj/daily_05-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_06-05.md": {
	id: "maj/daily_06-05.md";
  slug: "maj/daily_06-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_07-05.md": {
	id: "maj/daily_07-05.md";
  slug: "maj/daily_07-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_08-05.md": {
	id: "maj/daily_08-05.md";
  slug: "maj/daily_08-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_09-05.md": {
	id: "maj/daily_09-05.md";
  slug: "maj/daily_09-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_10-05.md": {
	id: "maj/daily_10-05.md";
  slug: "maj/daily_10-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_11-05.md": {
	id: "maj/daily_11-05.md";
  slug: "maj/daily_11-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_12-05.md": {
	id: "maj/daily_12-05.md";
  slug: "maj/daily_12-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_13-05.md": {
	id: "maj/daily_13-05.md";
  slug: "maj/daily_13-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_14-05.md": {
	id: "maj/daily_14-05.md";
  slug: "maj/daily_14-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_15-05.md": {
	id: "maj/daily_15-05.md";
  slug: "maj/daily_15-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_16-05.md": {
	id: "maj/daily_16-05.md";
  slug: "maj/daily_16-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_17-05.md": {
	id: "maj/daily_17-05.md";
  slug: "maj/daily_17-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_18-05.md": {
	id: "maj/daily_18-05.md";
  slug: "maj/daily_18-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_19-05.md": {
	id: "maj/daily_19-05.md";
  slug: "maj/daily_19-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_20-05.md": {
	id: "maj/daily_20-05.md";
  slug: "maj/daily_20-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_21-05.md": {
	id: "maj/daily_21-05.md";
  slug: "maj/daily_21-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_22-05.md": {
	id: "maj/daily_22-05.md";
  slug: "maj/daily_22-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_23-05.md": {
	id: "maj/daily_23-05.md";
  slug: "maj/daily_23-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_24-05.md": {
	id: "maj/daily_24-05.md";
  slug: "maj/daily_24-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_25-05.md": {
	id: "maj/daily_25-05.md";
  slug: "maj/daily_25-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_26-05.md": {
	id: "maj/daily_26-05.md";
  slug: "maj/daily_26-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_27-05.md": {
	id: "maj/daily_27-05.md";
  slug: "maj/daily_27-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_28-05.md": {
	id: "maj/daily_28-05.md";
  slug: "maj/daily_28-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_29-05.md": {
	id: "maj/daily_29-05.md";
  slug: "maj/daily_29-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_30-05.md": {
	id: "maj/daily_30-05.md";
  slug: "maj/daily_30-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"maj/daily_31-05.md": {
	id: "maj/daily_31-05.md";
  slug: "maj/daily_31-05";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_01-03.md": {
	id: "mart/daily_01-03.md";
  slug: "mart/daily_01-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_02-03.md": {
	id: "mart/daily_02-03.md";
  slug: "mart/daily_02-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_03-03.md": {
	id: "mart/daily_03-03.md";
  slug: "mart/daily_03-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_04-03.md": {
	id: "mart/daily_04-03.md";
  slug: "mart/daily_04-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_05-03.md": {
	id: "mart/daily_05-03.md";
  slug: "mart/daily_05-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_06-03.md": {
	id: "mart/daily_06-03.md";
  slug: "mart/daily_06-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_07-03.md": {
	id: "mart/daily_07-03.md";
  slug: "mart/daily_07-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_08-03.md": {
	id: "mart/daily_08-03.md";
  slug: "mart/daily_08-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_09-03.md": {
	id: "mart/daily_09-03.md";
  slug: "mart/daily_09-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_10-03.md": {
	id: "mart/daily_10-03.md";
  slug: "mart/daily_10-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_11-03.md": {
	id: "mart/daily_11-03.md";
  slug: "mart/daily_11-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_12-03.md": {
	id: "mart/daily_12-03.md";
  slug: "mart/daily_12-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_13-03.md": {
	id: "mart/daily_13-03.md";
  slug: "mart/daily_13-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_14-03.md": {
	id: "mart/daily_14-03.md";
  slug: "mart/daily_14-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_15-03.md": {
	id: "mart/daily_15-03.md";
  slug: "mart/daily_15-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_16-03.md": {
	id: "mart/daily_16-03.md";
  slug: "mart/daily_16-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_17-03.md": {
	id: "mart/daily_17-03.md";
  slug: "mart/daily_17-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_18-03.md": {
	id: "mart/daily_18-03.md";
  slug: "mart/daily_18-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_19-03.md": {
	id: "mart/daily_19-03.md";
  slug: "mart/daily_19-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_20-03.md": {
	id: "mart/daily_20-03.md";
  slug: "mart/daily_20-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_21-03.md": {
	id: "mart/daily_21-03.md";
  slug: "mart/daily_21-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_22-03.md": {
	id: "mart/daily_22-03.md";
  slug: "mart/daily_22-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_23-03.md": {
	id: "mart/daily_23-03.md";
  slug: "mart/daily_23-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_24-03.md": {
	id: "mart/daily_24-03.md";
  slug: "mart/daily_24-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_25-03.md": {
	id: "mart/daily_25-03.md";
  slug: "mart/daily_25-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_26-03.md": {
	id: "mart/daily_26-03.md";
  slug: "mart/daily_26-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_27-03.md": {
	id: "mart/daily_27-03.md";
  slug: "mart/daily_27-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_28-03.md": {
	id: "mart/daily_28-03.md";
  slug: "mart/daily_28-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_29-03.md": {
	id: "mart/daily_29-03.md";
  slug: "mart/daily_29-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_30-03.md": {
	id: "mart/daily_30-03.md";
  slug: "mart/daily_30-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"mart/daily_31-03.md": {
	id: "mart/daily_31-03.md";
  slug: "mart/daily_31-03";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_01-11.md": {
	id: "noyabr/daily_01-11.md";
  slug: "noyabr/daily_01-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_02-11.md": {
	id: "noyabr/daily_02-11.md";
  slug: "noyabr/daily_02-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_03-11.md": {
	id: "noyabr/daily_03-11.md";
  slug: "noyabr/daily_03-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_04-11.md": {
	id: "noyabr/daily_04-11.md";
  slug: "noyabr/daily_04-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_05-11.md": {
	id: "noyabr/daily_05-11.md";
  slug: "noyabr/daily_05-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_06-11.md": {
	id: "noyabr/daily_06-11.md";
  slug: "noyabr/daily_06-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_07-11.md": {
	id: "noyabr/daily_07-11.md";
  slug: "noyabr/daily_07-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_08-11.md": {
	id: "noyabr/daily_08-11.md";
  slug: "noyabr/daily_08-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_09-11.md": {
	id: "noyabr/daily_09-11.md";
  slug: "noyabr/daily_09-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_10-11.md": {
	id: "noyabr/daily_10-11.md";
  slug: "noyabr/daily_10-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_11-11.md": {
	id: "noyabr/daily_11-11.md";
  slug: "noyabr/daily_11-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_12-11.md": {
	id: "noyabr/daily_12-11.md";
  slug: "noyabr/daily_12-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_13-11.md": {
	id: "noyabr/daily_13-11.md";
  slug: "noyabr/daily_13-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_14-11.md": {
	id: "noyabr/daily_14-11.md";
  slug: "noyabr/daily_14-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_15-11.md": {
	id: "noyabr/daily_15-11.md";
  slug: "noyabr/daily_15-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_16-11.md": {
	id: "noyabr/daily_16-11.md";
  slug: "noyabr/daily_16-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_17-11.md": {
	id: "noyabr/daily_17-11.md";
  slug: "noyabr/daily_17-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_18-11.md": {
	id: "noyabr/daily_18-11.md";
  slug: "noyabr/daily_18-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_19-11.md": {
	id: "noyabr/daily_19-11.md";
  slug: "noyabr/daily_19-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_20-11.md": {
	id: "noyabr/daily_20-11.md";
  slug: "noyabr/daily_20-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_21-11.md": {
	id: "noyabr/daily_21-11.md";
  slug: "noyabr/daily_21-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_22-11.md": {
	id: "noyabr/daily_22-11.md";
  slug: "noyabr/daily_22-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_23-11.md": {
	id: "noyabr/daily_23-11.md";
  slug: "noyabr/daily_23-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_24-11.md": {
	id: "noyabr/daily_24-11.md";
  slug: "noyabr/daily_24-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_25-11.md": {
	id: "noyabr/daily_25-11.md";
  slug: "noyabr/daily_25-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_26-11.md": {
	id: "noyabr/daily_26-11.md";
  slug: "noyabr/daily_26-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_27-11.md": {
	id: "noyabr/daily_27-11.md";
  slug: "noyabr/daily_27-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_28-11.md": {
	id: "noyabr/daily_28-11.md";
  slug: "noyabr/daily_28-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_29-11.md": {
	id: "noyabr/daily_29-11.md";
  slug: "noyabr/daily_29-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"noyabr/daily_30-11.md": {
	id: "noyabr/daily_30-11.md";
  slug: "noyabr/daily_30-11";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_01-10.md": {
	id: "oktyabr/daily_01-10.md";
  slug: "oktyabr/daily_01-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_02-10.md": {
	id: "oktyabr/daily_02-10.md";
  slug: "oktyabr/daily_02-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_03-10.md": {
	id: "oktyabr/daily_03-10.md";
  slug: "oktyabr/daily_03-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_04-10.md": {
	id: "oktyabr/daily_04-10.md";
  slug: "oktyabr/daily_04-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_05-10.md": {
	id: "oktyabr/daily_05-10.md";
  slug: "oktyabr/daily_05-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_06-10.md": {
	id: "oktyabr/daily_06-10.md";
  slug: "oktyabr/daily_06-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_07-10.md": {
	id: "oktyabr/daily_07-10.md";
  slug: "oktyabr/daily_07-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_08-10.md": {
	id: "oktyabr/daily_08-10.md";
  slug: "oktyabr/daily_08-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_09-10.md": {
	id: "oktyabr/daily_09-10.md";
  slug: "oktyabr/daily_09-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_10-10.md": {
	id: "oktyabr/daily_10-10.md";
  slug: "oktyabr/daily_10-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_11-10.md": {
	id: "oktyabr/daily_11-10.md";
  slug: "oktyabr/daily_11-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_12-10.md": {
	id: "oktyabr/daily_12-10.md";
  slug: "oktyabr/daily_12-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_13-10.md": {
	id: "oktyabr/daily_13-10.md";
  slug: "oktyabr/daily_13-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_14-10.md": {
	id: "oktyabr/daily_14-10.md";
  slug: "oktyabr/daily_14-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_15-10.md": {
	id: "oktyabr/daily_15-10.md";
  slug: "oktyabr/daily_15-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_16-10.md": {
	id: "oktyabr/daily_16-10.md";
  slug: "oktyabr/daily_16-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_17-10.md": {
	id: "oktyabr/daily_17-10.md";
  slug: "oktyabr/daily_17-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_18-10.md": {
	id: "oktyabr/daily_18-10.md";
  slug: "oktyabr/daily_18-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_19-10.md": {
	id: "oktyabr/daily_19-10.md";
  slug: "oktyabr/daily_19-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_20-10.md": {
	id: "oktyabr/daily_20-10.md";
  slug: "oktyabr/daily_20-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_21-10.md": {
	id: "oktyabr/daily_21-10.md";
  slug: "oktyabr/daily_21-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_22-10.md": {
	id: "oktyabr/daily_22-10.md";
  slug: "oktyabr/daily_22-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_23-10.md": {
	id: "oktyabr/daily_23-10.md";
  slug: "oktyabr/daily_23-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_24-10.md": {
	id: "oktyabr/daily_24-10.md";
  slug: "oktyabr/daily_24-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_25-10.md": {
	id: "oktyabr/daily_25-10.md";
  slug: "oktyabr/daily_25-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_26-10.md": {
	id: "oktyabr/daily_26-10.md";
  slug: "oktyabr/daily_26-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_27-10.md": {
	id: "oktyabr/daily_27-10.md";
  slug: "oktyabr/daily_27-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_28-10.md": {
	id: "oktyabr/daily_28-10.md";
  slug: "oktyabr/daily_28-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_29-10.md": {
	id: "oktyabr/daily_29-10.md";
  slug: "oktyabr/daily_29-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_30-10.md": {
	id: "oktyabr/daily_30-10.md";
  slug: "oktyabr/daily_30-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"oktyabr/daily_31-10.md": {
	id: "oktyabr/daily_31-10.md";
  slug: "oktyabr/daily_31-10";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_01-09.md": {
	id: "sentyabr/daily_01-09.md";
  slug: "sentyabr/daily_01-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_02-09.md": {
	id: "sentyabr/daily_02-09.md";
  slug: "sentyabr/daily_02-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_03-09.md": {
	id: "sentyabr/daily_03-09.md";
  slug: "sentyabr/daily_03-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_04-09.md": {
	id: "sentyabr/daily_04-09.md";
  slug: "sentyabr/daily_04-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_05-09.md": {
	id: "sentyabr/daily_05-09.md";
  slug: "sentyabr/daily_05-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_06-09.md": {
	id: "sentyabr/daily_06-09.md";
  slug: "sentyabr/daily_06-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_07-09.md": {
	id: "sentyabr/daily_07-09.md";
  slug: "sentyabr/daily_07-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_08-09.md": {
	id: "sentyabr/daily_08-09.md";
  slug: "sentyabr/daily_08-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_09-09.md": {
	id: "sentyabr/daily_09-09.md";
  slug: "sentyabr/daily_09-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_10-09.md": {
	id: "sentyabr/daily_10-09.md";
  slug: "sentyabr/daily_10-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_11-09.md": {
	id: "sentyabr/daily_11-09.md";
  slug: "sentyabr/daily_11-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_12-09.md": {
	id: "sentyabr/daily_12-09.md";
  slug: "sentyabr/daily_12-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_13-09.md": {
	id: "sentyabr/daily_13-09.md";
  slug: "sentyabr/daily_13-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_14-09.md": {
	id: "sentyabr/daily_14-09.md";
  slug: "sentyabr/daily_14-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_15-09.md": {
	id: "sentyabr/daily_15-09.md";
  slug: "sentyabr/daily_15-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_16-09.md": {
	id: "sentyabr/daily_16-09.md";
  slug: "sentyabr/daily_16-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_17-09.md": {
	id: "sentyabr/daily_17-09.md";
  slug: "sentyabr/daily_17-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_18-09.md": {
	id: "sentyabr/daily_18-09.md";
  slug: "sentyabr/daily_18-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_19-09.md": {
	id: "sentyabr/daily_19-09.md";
  slug: "sentyabr/daily_19-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_20-09.md": {
	id: "sentyabr/daily_20-09.md";
  slug: "sentyabr/daily_20-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_21-09.md": {
	id: "sentyabr/daily_21-09.md";
  slug: "sentyabr/daily_21-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_22-09.md": {
	id: "sentyabr/daily_22-09.md";
  slug: "sentyabr/daily_22-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_23-09.md": {
	id: "sentyabr/daily_23-09.md";
  slug: "sentyabr/daily_23-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_24-09.md": {
	id: "sentyabr/daily_24-09.md";
  slug: "sentyabr/daily_24-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_25-09.md": {
	id: "sentyabr/daily_25-09.md";
  slug: "sentyabr/daily_25-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_26-09.md": {
	id: "sentyabr/daily_26-09.md";
  slug: "sentyabr/daily_26-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_27-09.md": {
	id: "sentyabr/daily_27-09.md";
  slug: "sentyabr/daily_27-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_28-09.md": {
	id: "sentyabr/daily_28-09.md";
  slug: "sentyabr/daily_28-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_29-09.md": {
	id: "sentyabr/daily_29-09.md";
  slug: "sentyabr/daily_29-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"sentyabr/daily_30-09.md": {
	id: "sentyabr/daily_30-09.md";
  slug: "sentyabr/daily_30-09";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_01-01.md": {
	id: "yanvar/daily_01-01.md";
  slug: "yanvar/daily_01-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_02-01.md": {
	id: "yanvar/daily_02-01.md";
  slug: "yanvar/daily_02-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_03-01.md": {
	id: "yanvar/daily_03-01.md";
  slug: "yanvar/daily_03-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_04-01.md": {
	id: "yanvar/daily_04-01.md";
  slug: "yanvar/daily_04-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_05-01.md": {
	id: "yanvar/daily_05-01.md";
  slug: "yanvar/daily_05-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_06-01.md": {
	id: "yanvar/daily_06-01.md";
  slug: "yanvar/daily_06-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_07-01.md": {
	id: "yanvar/daily_07-01.md";
  slug: "yanvar/daily_07-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_08-01.md": {
	id: "yanvar/daily_08-01.md";
  slug: "yanvar/daily_08-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_09-01.md": {
	id: "yanvar/daily_09-01.md";
  slug: "yanvar/daily_09-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_10-01.md": {
	id: "yanvar/daily_10-01.md";
  slug: "yanvar/daily_10-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_11-01.md": {
	id: "yanvar/daily_11-01.md";
  slug: "yanvar/daily_11-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_12-01.md": {
	id: "yanvar/daily_12-01.md";
  slug: "yanvar/daily_12-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_13-01.md": {
	id: "yanvar/daily_13-01.md";
  slug: "yanvar/daily_13-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_14-01.md": {
	id: "yanvar/daily_14-01.md";
  slug: "yanvar/daily_14-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_15-01.md": {
	id: "yanvar/daily_15-01.md";
  slug: "yanvar/daily_15-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_16-01.md": {
	id: "yanvar/daily_16-01.md";
  slug: "yanvar/daily_16-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_17-01.md": {
	id: "yanvar/daily_17-01.md";
  slug: "yanvar/daily_17-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_18-01.md": {
	id: "yanvar/daily_18-01.md";
  slug: "yanvar/daily_18-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_19-01.md": {
	id: "yanvar/daily_19-01.md";
  slug: "yanvar/daily_19-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_20-01.md": {
	id: "yanvar/daily_20-01.md";
  slug: "yanvar/daily_20-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_21-01.md": {
	id: "yanvar/daily_21-01.md";
  slug: "yanvar/daily_21-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_22-01.md": {
	id: "yanvar/daily_22-01.md";
  slug: "yanvar/daily_22-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_23-01.md": {
	id: "yanvar/daily_23-01.md";
  slug: "yanvar/daily_23-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_24-01.md": {
	id: "yanvar/daily_24-01.md";
  slug: "yanvar/daily_24-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_25-01.md": {
	id: "yanvar/daily_25-01.md";
  slug: "yanvar/daily_25-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_26-01.md": {
	id: "yanvar/daily_26-01.md";
  slug: "yanvar/daily_26-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_27-01.md": {
	id: "yanvar/daily_27-01.md";
  slug: "yanvar/daily_27-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_28-01.md": {
	id: "yanvar/daily_28-01.md";
  slug: "yanvar/daily_28-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_29-01.md": {
	id: "yanvar/daily_29-01.md";
  slug: "yanvar/daily_29-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_30-01.md": {
	id: "yanvar/daily_30-01.md";
  slug: "yanvar/daily_30-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
"yanvar/daily_31-01.md": {
	id: "yanvar/daily_31-01.md";
  slug: "yanvar/daily_31-01";
  body: string;
  collection: "aa24hours";
  data: InferEntrySchema<"aa24hours">
} & { render(): Render[".md"] };
};
"aadays": {
"april/daily_01-04.md": {
	id: "april/daily_01-04.md";
  slug: "april/daily_01-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_02-04.md": {
	id: "april/daily_02-04.md";
  slug: "april/daily_02-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_03-04.md": {
	id: "april/daily_03-04.md";
  slug: "april/daily_03-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_04-04.md": {
	id: "april/daily_04-04.md";
  slug: "april/daily_04-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_05-04.md": {
	id: "april/daily_05-04.md";
  slug: "april/daily_05-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_06-04.md": {
	id: "april/daily_06-04.md";
  slug: "april/daily_06-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_07-04.md": {
	id: "april/daily_07-04.md";
  slug: "april/daily_07-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_08-04.md": {
	id: "april/daily_08-04.md";
  slug: "april/daily_08-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_09-04.md": {
	id: "april/daily_09-04.md";
  slug: "april/daily_09-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_10-04.md": {
	id: "april/daily_10-04.md";
  slug: "april/daily_10-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_11-04.md": {
	id: "april/daily_11-04.md";
  slug: "april/daily_11-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_12-04.md": {
	id: "april/daily_12-04.md";
  slug: "april/daily_12-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_13-04.md": {
	id: "april/daily_13-04.md";
  slug: "april/daily_13-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_14-04.md": {
	id: "april/daily_14-04.md";
  slug: "april/daily_14-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_15-04.md": {
	id: "april/daily_15-04.md";
  slug: "april/daily_15-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_16-04.md": {
	id: "april/daily_16-04.md";
  slug: "april/daily_16-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_17-04.md": {
	id: "april/daily_17-04.md";
  slug: "april/daily_17-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_18-04.md": {
	id: "april/daily_18-04.md";
  slug: "april/daily_18-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_19-04.md": {
	id: "april/daily_19-04.md";
  slug: "april/daily_19-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_20-04.md": {
	id: "april/daily_20-04.md";
  slug: "april/daily_20-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_21-04.md": {
	id: "april/daily_21-04.md";
  slug: "april/daily_21-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_22-04.md": {
	id: "april/daily_22-04.md";
  slug: "april/daily_22-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_23-04.md": {
	id: "april/daily_23-04.md";
  slug: "april/daily_23-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_24-04.md": {
	id: "april/daily_24-04.md";
  slug: "april/daily_24-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_25-04.md": {
	id: "april/daily_25-04.md";
  slug: "april/daily_25-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_26-04.md": {
	id: "april/daily_26-04.md";
  slug: "april/daily_26-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_27-04.md": {
	id: "april/daily_27-04.md";
  slug: "april/daily_27-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_28-04.md": {
	id: "april/daily_28-04.md";
  slug: "april/daily_28-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_29-04.md": {
	id: "april/daily_29-04.md";
  slug: "april/daily_29-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"april/daily_30-04.md": {
	id: "april/daily_30-04.md";
  slug: "april/daily_30-04";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_01-08.md": {
	id: "avgust/daily_01-08.md";
  slug: "avgust/daily_01-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_02-08.md": {
	id: "avgust/daily_02-08.md";
  slug: "avgust/daily_02-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_03-08.md": {
	id: "avgust/daily_03-08.md";
  slug: "avgust/daily_03-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_04-08.md": {
	id: "avgust/daily_04-08.md";
  slug: "avgust/daily_04-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_05-08.md": {
	id: "avgust/daily_05-08.md";
  slug: "avgust/daily_05-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_06-08.md": {
	id: "avgust/daily_06-08.md";
  slug: "avgust/daily_06-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_07-08.md": {
	id: "avgust/daily_07-08.md";
  slug: "avgust/daily_07-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_08-08.md": {
	id: "avgust/daily_08-08.md";
  slug: "avgust/daily_08-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_09-08.md": {
	id: "avgust/daily_09-08.md";
  slug: "avgust/daily_09-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_10-08.md": {
	id: "avgust/daily_10-08.md";
  slug: "avgust/daily_10-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_11-08.md": {
	id: "avgust/daily_11-08.md";
  slug: "avgust/daily_11-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_12-08.md": {
	id: "avgust/daily_12-08.md";
  slug: "avgust/daily_12-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_13-08.md": {
	id: "avgust/daily_13-08.md";
  slug: "avgust/daily_13-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_14-08.md": {
	id: "avgust/daily_14-08.md";
  slug: "avgust/daily_14-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_15-08.md": {
	id: "avgust/daily_15-08.md";
  slug: "avgust/daily_15-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_16-08.md": {
	id: "avgust/daily_16-08.md";
  slug: "avgust/daily_16-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_17-08.md": {
	id: "avgust/daily_17-08.md";
  slug: "avgust/daily_17-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_18-08.md": {
	id: "avgust/daily_18-08.md";
  slug: "avgust/daily_18-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_19-08.md": {
	id: "avgust/daily_19-08.md";
  slug: "avgust/daily_19-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_20-08.md": {
	id: "avgust/daily_20-08.md";
  slug: "avgust/daily_20-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_21-08.md": {
	id: "avgust/daily_21-08.md";
  slug: "avgust/daily_21-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_22-08.md": {
	id: "avgust/daily_22-08.md";
  slug: "avgust/daily_22-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_23-08.md": {
	id: "avgust/daily_23-08.md";
  slug: "avgust/daily_23-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_24-08.md": {
	id: "avgust/daily_24-08.md";
  slug: "avgust/daily_24-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_25-08.md": {
	id: "avgust/daily_25-08.md";
  slug: "avgust/daily_25-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_26-08.md": {
	id: "avgust/daily_26-08.md";
  slug: "avgust/daily_26-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_27-08.md": {
	id: "avgust/daily_27-08.md";
  slug: "avgust/daily_27-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_28-08.md": {
	id: "avgust/daily_28-08.md";
  slug: "avgust/daily_28-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_29-08.md": {
	id: "avgust/daily_29-08.md";
  slug: "avgust/daily_29-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_30-08.md": {
	id: "avgust/daily_30-08.md";
  slug: "avgust/daily_30-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"avgust/daily_31-08.md": {
	id: "avgust/daily_31-08.md";
  slug: "avgust/daily_31-08";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_01-12.md": {
	id: "dekabr/daily_01-12.md";
  slug: "dekabr/daily_01-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_02-12.md": {
	id: "dekabr/daily_02-12.md";
  slug: "dekabr/daily_02-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_03-12.md": {
	id: "dekabr/daily_03-12.md";
  slug: "dekabr/daily_03-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_04-12.md": {
	id: "dekabr/daily_04-12.md";
  slug: "dekabr/daily_04-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_05-12.md": {
	id: "dekabr/daily_05-12.md";
  slug: "dekabr/daily_05-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_06-12.md": {
	id: "dekabr/daily_06-12.md";
  slug: "dekabr/daily_06-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_07-12.md": {
	id: "dekabr/daily_07-12.md";
  slug: "dekabr/daily_07-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_08-12.md": {
	id: "dekabr/daily_08-12.md";
  slug: "dekabr/daily_08-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_09-12.md": {
	id: "dekabr/daily_09-12.md";
  slug: "dekabr/daily_09-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_10-12.md": {
	id: "dekabr/daily_10-12.md";
  slug: "dekabr/daily_10-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_11-12.md": {
	id: "dekabr/daily_11-12.md";
  slug: "dekabr/daily_11-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_12-12.md": {
	id: "dekabr/daily_12-12.md";
  slug: "dekabr/daily_12-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_13-12.md": {
	id: "dekabr/daily_13-12.md";
  slug: "dekabr/daily_13-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_14-12.md": {
	id: "dekabr/daily_14-12.md";
  slug: "dekabr/daily_14-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_15-12.md": {
	id: "dekabr/daily_15-12.md";
  slug: "dekabr/daily_15-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_16-12.md": {
	id: "dekabr/daily_16-12.md";
  slug: "dekabr/daily_16-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_17-12.md": {
	id: "dekabr/daily_17-12.md";
  slug: "dekabr/daily_17-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_18-12.md": {
	id: "dekabr/daily_18-12.md";
  slug: "dekabr/daily_18-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_19-12.md": {
	id: "dekabr/daily_19-12.md";
  slug: "dekabr/daily_19-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_20-12.md": {
	id: "dekabr/daily_20-12.md";
  slug: "dekabr/daily_20-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_21-12.md": {
	id: "dekabr/daily_21-12.md";
  slug: "dekabr/daily_21-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_22-12.md": {
	id: "dekabr/daily_22-12.md";
  slug: "dekabr/daily_22-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_23-12.md": {
	id: "dekabr/daily_23-12.md";
  slug: "dekabr/daily_23-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_24-12.md": {
	id: "dekabr/daily_24-12.md";
  slug: "dekabr/daily_24-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_25-12.md": {
	id: "dekabr/daily_25-12.md";
  slug: "dekabr/daily_25-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_26-12.md": {
	id: "dekabr/daily_26-12.md";
  slug: "dekabr/daily_26-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_27-12.md": {
	id: "dekabr/daily_27-12.md";
  slug: "dekabr/daily_27-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_28-12.md": {
	id: "dekabr/daily_28-12.md";
  slug: "dekabr/daily_28-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_29-12.md": {
	id: "dekabr/daily_29-12.md";
  slug: "dekabr/daily_29-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_30-12.md": {
	id: "dekabr/daily_30-12.md";
  slug: "dekabr/daily_30-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"dekabr/daily_31-12.md": {
	id: "dekabr/daily_31-12.md";
  slug: "dekabr/daily_31-12";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_01-02.md": {
	id: "fevral/daily_01-02.md";
  slug: "fevral/daily_01-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_02-02.md": {
	id: "fevral/daily_02-02.md";
  slug: "fevral/daily_02-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_03-02.md": {
	id: "fevral/daily_03-02.md";
  slug: "fevral/daily_03-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_04-02.md": {
	id: "fevral/daily_04-02.md";
  slug: "fevral/daily_04-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_05-02.md": {
	id: "fevral/daily_05-02.md";
  slug: "fevral/daily_05-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_06-02.md": {
	id: "fevral/daily_06-02.md";
  slug: "fevral/daily_06-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_07-02.md": {
	id: "fevral/daily_07-02.md";
  slug: "fevral/daily_07-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_08-02.md": {
	id: "fevral/daily_08-02.md";
  slug: "fevral/daily_08-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_09-02.md": {
	id: "fevral/daily_09-02.md";
  slug: "fevral/daily_09-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_10-02.md": {
	id: "fevral/daily_10-02.md";
  slug: "fevral/daily_10-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_11-02.md": {
	id: "fevral/daily_11-02.md";
  slug: "fevral/daily_11-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_12-02.md": {
	id: "fevral/daily_12-02.md";
  slug: "fevral/daily_12-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_13-02.md": {
	id: "fevral/daily_13-02.md";
  slug: "fevral/daily_13-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_14-02.md": {
	id: "fevral/daily_14-02.md";
  slug: "fevral/daily_14-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_15-02.md": {
	id: "fevral/daily_15-02.md";
  slug: "fevral/daily_15-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_16-02.md": {
	id: "fevral/daily_16-02.md";
  slug: "fevral/daily_16-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_17-02.md": {
	id: "fevral/daily_17-02.md";
  slug: "fevral/daily_17-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_18-02.md": {
	id: "fevral/daily_18-02.md";
  slug: "fevral/daily_18-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_19-02.md": {
	id: "fevral/daily_19-02.md";
  slug: "fevral/daily_19-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_20-02.md": {
	id: "fevral/daily_20-02.md";
  slug: "fevral/daily_20-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_21-02.md": {
	id: "fevral/daily_21-02.md";
  slug: "fevral/daily_21-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_22-02.md": {
	id: "fevral/daily_22-02.md";
  slug: "fevral/daily_22-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_23-02.md": {
	id: "fevral/daily_23-02.md";
  slug: "fevral/daily_23-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_24-02.md": {
	id: "fevral/daily_24-02.md";
  slug: "fevral/daily_24-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_25-02.md": {
	id: "fevral/daily_25-02.md";
  slug: "fevral/daily_25-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_26-02.md": {
	id: "fevral/daily_26-02.md";
  slug: "fevral/daily_26-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_27-02.md": {
	id: "fevral/daily_27-02.md";
  slug: "fevral/daily_27-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_28-02.md": {
	id: "fevral/daily_28-02.md";
  slug: "fevral/daily_28-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"fevral/daily_29-02.md": {
	id: "fevral/daily_29-02.md";
  slug: "fevral/daily_29-02";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_01-07.md": {
	id: "iyul/daily_01-07.md";
  slug: "iyul/daily_01-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_02-07.md": {
	id: "iyul/daily_02-07.md";
  slug: "iyul/daily_02-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_03-07.md": {
	id: "iyul/daily_03-07.md";
  slug: "iyul/daily_03-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_04-07.md": {
	id: "iyul/daily_04-07.md";
  slug: "iyul/daily_04-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_05-07.md": {
	id: "iyul/daily_05-07.md";
  slug: "iyul/daily_05-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_06-07.md": {
	id: "iyul/daily_06-07.md";
  slug: "iyul/daily_06-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_07-07.md": {
	id: "iyul/daily_07-07.md";
  slug: "iyul/daily_07-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_08-07.md": {
	id: "iyul/daily_08-07.md";
  slug: "iyul/daily_08-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_09-07.md": {
	id: "iyul/daily_09-07.md";
  slug: "iyul/daily_09-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_10-07.md": {
	id: "iyul/daily_10-07.md";
  slug: "iyul/daily_10-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_11-07.md": {
	id: "iyul/daily_11-07.md";
  slug: "iyul/daily_11-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_12-07.md": {
	id: "iyul/daily_12-07.md";
  slug: "iyul/daily_12-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_13-07.md": {
	id: "iyul/daily_13-07.md";
  slug: "iyul/daily_13-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_14-07.md": {
	id: "iyul/daily_14-07.md";
  slug: "iyul/daily_14-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_15-07.md": {
	id: "iyul/daily_15-07.md";
  slug: "iyul/daily_15-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_16-07.md": {
	id: "iyul/daily_16-07.md";
  slug: "iyul/daily_16-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_17-07.md": {
	id: "iyul/daily_17-07.md";
  slug: "iyul/daily_17-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_18-07.md": {
	id: "iyul/daily_18-07.md";
  slug: "iyul/daily_18-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_19-07.md": {
	id: "iyul/daily_19-07.md";
  slug: "iyul/daily_19-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_20-07.md": {
	id: "iyul/daily_20-07.md";
  slug: "iyul/daily_20-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_21-07.md": {
	id: "iyul/daily_21-07.md";
  slug: "iyul/daily_21-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_22-07.md": {
	id: "iyul/daily_22-07.md";
  slug: "iyul/daily_22-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_23-07.md": {
	id: "iyul/daily_23-07.md";
  slug: "iyul/daily_23-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_24-07.md": {
	id: "iyul/daily_24-07.md";
  slug: "iyul/daily_24-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_25-07.md": {
	id: "iyul/daily_25-07.md";
  slug: "iyul/daily_25-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_26-07.md": {
	id: "iyul/daily_26-07.md";
  slug: "iyul/daily_26-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_27-07.md": {
	id: "iyul/daily_27-07.md";
  slug: "iyul/daily_27-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_28-07.md": {
	id: "iyul/daily_28-07.md";
  slug: "iyul/daily_28-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_29-07.md": {
	id: "iyul/daily_29-07.md";
  slug: "iyul/daily_29-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_30-07.md": {
	id: "iyul/daily_30-07.md";
  slug: "iyul/daily_30-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyul/daily_31-07.md": {
	id: "iyul/daily_31-07.md";
  slug: "iyul/daily_31-07";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_01-06.md": {
	id: "iyun/daily_01-06.md";
  slug: "iyun/daily_01-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_02-06.md": {
	id: "iyun/daily_02-06.md";
  slug: "iyun/daily_02-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_03-06.md": {
	id: "iyun/daily_03-06.md";
  slug: "iyun/daily_03-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_04-06.md": {
	id: "iyun/daily_04-06.md";
  slug: "iyun/daily_04-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_05-06.md": {
	id: "iyun/daily_05-06.md";
  slug: "iyun/daily_05-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_06-06.md": {
	id: "iyun/daily_06-06.md";
  slug: "iyun/daily_06-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_07-06.md": {
	id: "iyun/daily_07-06.md";
  slug: "iyun/daily_07-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_08-06.md": {
	id: "iyun/daily_08-06.md";
  slug: "iyun/daily_08-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_09-06.md": {
	id: "iyun/daily_09-06.md";
  slug: "iyun/daily_09-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_10-06.md": {
	id: "iyun/daily_10-06.md";
  slug: "iyun/daily_10-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_11-06.md": {
	id: "iyun/daily_11-06.md";
  slug: "iyun/daily_11-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_12-06.md": {
	id: "iyun/daily_12-06.md";
  slug: "iyun/daily_12-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_13-06.md": {
	id: "iyun/daily_13-06.md";
  slug: "iyun/daily_13-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_14-06.md": {
	id: "iyun/daily_14-06.md";
  slug: "iyun/daily_14-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_15-06.md": {
	id: "iyun/daily_15-06.md";
  slug: "iyun/daily_15-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_16-06.md": {
	id: "iyun/daily_16-06.md";
  slug: "iyun/daily_16-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_17-06.md": {
	id: "iyun/daily_17-06.md";
  slug: "iyun/daily_17-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_18-06.md": {
	id: "iyun/daily_18-06.md";
  slug: "iyun/daily_18-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_19-06.md": {
	id: "iyun/daily_19-06.md";
  slug: "iyun/daily_19-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_20-06.md": {
	id: "iyun/daily_20-06.md";
  slug: "iyun/daily_20-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_21-06.md": {
	id: "iyun/daily_21-06.md";
  slug: "iyun/daily_21-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_22-06.md": {
	id: "iyun/daily_22-06.md";
  slug: "iyun/daily_22-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_23-06.md": {
	id: "iyun/daily_23-06.md";
  slug: "iyun/daily_23-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_24-06.md": {
	id: "iyun/daily_24-06.md";
  slug: "iyun/daily_24-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_25-06.md": {
	id: "iyun/daily_25-06.md";
  slug: "iyun/daily_25-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_26-06.md": {
	id: "iyun/daily_26-06.md";
  slug: "iyun/daily_26-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_27-06.md": {
	id: "iyun/daily_27-06.md";
  slug: "iyun/daily_27-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_28-06.md": {
	id: "iyun/daily_28-06.md";
  slug: "iyun/daily_28-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_29-06.md": {
	id: "iyun/daily_29-06.md";
  slug: "iyun/daily_29-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"iyun/daily_30-06.md": {
	id: "iyun/daily_30-06.md";
  slug: "iyun/daily_30-06";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_01-05.md": {
	id: "maj/daily_01-05.md";
  slug: "maj/daily_01-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_02-05.md": {
	id: "maj/daily_02-05.md";
  slug: "maj/daily_02-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_03-05.md": {
	id: "maj/daily_03-05.md";
  slug: "maj/daily_03-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_04-05.md": {
	id: "maj/daily_04-05.md";
  slug: "maj/daily_04-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_05-05.md": {
	id: "maj/daily_05-05.md";
  slug: "maj/daily_05-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_06-05.md": {
	id: "maj/daily_06-05.md";
  slug: "maj/daily_06-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_07-05.md": {
	id: "maj/daily_07-05.md";
  slug: "maj/daily_07-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_08-05.md": {
	id: "maj/daily_08-05.md";
  slug: "maj/daily_08-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_09-05.md": {
	id: "maj/daily_09-05.md";
  slug: "maj/daily_09-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_10-05.md": {
	id: "maj/daily_10-05.md";
  slug: "maj/daily_10-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_11-05.md": {
	id: "maj/daily_11-05.md";
  slug: "maj/daily_11-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_12-05.md": {
	id: "maj/daily_12-05.md";
  slug: "maj/daily_12-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_13-05.md": {
	id: "maj/daily_13-05.md";
  slug: "maj/daily_13-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_14-05.md": {
	id: "maj/daily_14-05.md";
  slug: "maj/daily_14-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_15-05.md": {
	id: "maj/daily_15-05.md";
  slug: "maj/daily_15-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_16-05.md": {
	id: "maj/daily_16-05.md";
  slug: "maj/daily_16-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_17-05.md": {
	id: "maj/daily_17-05.md";
  slug: "maj/daily_17-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_18-05.md": {
	id: "maj/daily_18-05.md";
  slug: "maj/daily_18-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_19-05.md": {
	id: "maj/daily_19-05.md";
  slug: "maj/daily_19-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_20-05.md": {
	id: "maj/daily_20-05.md";
  slug: "maj/daily_20-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_21-05.md": {
	id: "maj/daily_21-05.md";
  slug: "maj/daily_21-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_22-05.md": {
	id: "maj/daily_22-05.md";
  slug: "maj/daily_22-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_23-05.md": {
	id: "maj/daily_23-05.md";
  slug: "maj/daily_23-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_24-05.md": {
	id: "maj/daily_24-05.md";
  slug: "maj/daily_24-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_25-05.md": {
	id: "maj/daily_25-05.md";
  slug: "maj/daily_25-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_26-05.md": {
	id: "maj/daily_26-05.md";
  slug: "maj/daily_26-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_27-05.md": {
	id: "maj/daily_27-05.md";
  slug: "maj/daily_27-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_28-05.md": {
	id: "maj/daily_28-05.md";
  slug: "maj/daily_28-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_29-05.md": {
	id: "maj/daily_29-05.md";
  slug: "maj/daily_29-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_30-05.md": {
	id: "maj/daily_30-05.md";
  slug: "maj/daily_30-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"maj/daily_31-05.md": {
	id: "maj/daily_31-05.md";
  slug: "maj/daily_31-05";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_01-03.md": {
	id: "mart/daily_01-03.md";
  slug: "mart/daily_01-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_02-03.md": {
	id: "mart/daily_02-03.md";
  slug: "mart/daily_02-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_03-03.md": {
	id: "mart/daily_03-03.md";
  slug: "mart/daily_03-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_04-03.md": {
	id: "mart/daily_04-03.md";
  slug: "mart/daily_04-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_05-03.md": {
	id: "mart/daily_05-03.md";
  slug: "mart/daily_05-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_06-03.md": {
	id: "mart/daily_06-03.md";
  slug: "mart/daily_06-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_07-03.md": {
	id: "mart/daily_07-03.md";
  slug: "mart/daily_07-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_08-03.md": {
	id: "mart/daily_08-03.md";
  slug: "mart/daily_08-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_09-03.md": {
	id: "mart/daily_09-03.md";
  slug: "mart/daily_09-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_10-03.md": {
	id: "mart/daily_10-03.md";
  slug: "mart/daily_10-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_11-03.md": {
	id: "mart/daily_11-03.md";
  slug: "mart/daily_11-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_12-03.md": {
	id: "mart/daily_12-03.md";
  slug: "mart/daily_12-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_13-03.md": {
	id: "mart/daily_13-03.md";
  slug: "mart/daily_13-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_14-03.md": {
	id: "mart/daily_14-03.md";
  slug: "mart/daily_14-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_15-03.md": {
	id: "mart/daily_15-03.md";
  slug: "mart/daily_15-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_16-03.md": {
	id: "mart/daily_16-03.md";
  slug: "mart/daily_16-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_17-03.md": {
	id: "mart/daily_17-03.md";
  slug: "mart/daily_17-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_18-03.md": {
	id: "mart/daily_18-03.md";
  slug: "mart/daily_18-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_19-03.md": {
	id: "mart/daily_19-03.md";
  slug: "mart/daily_19-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_20-03.md": {
	id: "mart/daily_20-03.md";
  slug: "mart/daily_20-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_21-03.md": {
	id: "mart/daily_21-03.md";
  slug: "mart/daily_21-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_22-03.md": {
	id: "mart/daily_22-03.md";
  slug: "mart/daily_22-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_23-03.md": {
	id: "mart/daily_23-03.md";
  slug: "mart/daily_23-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_24-03.md": {
	id: "mart/daily_24-03.md";
  slug: "mart/daily_24-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_25-03.md": {
	id: "mart/daily_25-03.md";
  slug: "mart/daily_25-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_26-03.md": {
	id: "mart/daily_26-03.md";
  slug: "mart/daily_26-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_27-03.md": {
	id: "mart/daily_27-03.md";
  slug: "mart/daily_27-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_28-03.md": {
	id: "mart/daily_28-03.md";
  slug: "mart/daily_28-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_29-03.md": {
	id: "mart/daily_29-03.md";
  slug: "mart/daily_29-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_30-03.md": {
	id: "mart/daily_30-03.md";
  slug: "mart/daily_30-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"mart/daily_31-03.md": {
	id: "mart/daily_31-03.md";
  slug: "mart/daily_31-03";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_01-11.md": {
	id: "noyabr/daily_01-11.md";
  slug: "noyabr/daily_01-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_02-11.md": {
	id: "noyabr/daily_02-11.md";
  slug: "noyabr/daily_02-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_03-11.md": {
	id: "noyabr/daily_03-11.md";
  slug: "noyabr/daily_03-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_04-11.md": {
	id: "noyabr/daily_04-11.md";
  slug: "noyabr/daily_04-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_05-11.md": {
	id: "noyabr/daily_05-11.md";
  slug: "noyabr/daily_05-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_06-11.md": {
	id: "noyabr/daily_06-11.md";
  slug: "noyabr/daily_06-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_07-11.md": {
	id: "noyabr/daily_07-11.md";
  slug: "noyabr/daily_07-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_08-11.md": {
	id: "noyabr/daily_08-11.md";
  slug: "noyabr/daily_08-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_09-11.md": {
	id: "noyabr/daily_09-11.md";
  slug: "noyabr/daily_09-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_10-11.md": {
	id: "noyabr/daily_10-11.md";
  slug: "noyabr/daily_10-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_11-11.md": {
	id: "noyabr/daily_11-11.md";
  slug: "noyabr/daily_11-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_12-11.md": {
	id: "noyabr/daily_12-11.md";
  slug: "noyabr/daily_12-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_13-11.md": {
	id: "noyabr/daily_13-11.md";
  slug: "noyabr/daily_13-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_14-11.md": {
	id: "noyabr/daily_14-11.md";
  slug: "noyabr/daily_14-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_15-11.md": {
	id: "noyabr/daily_15-11.md";
  slug: "noyabr/daily_15-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_16-11.md": {
	id: "noyabr/daily_16-11.md";
  slug: "noyabr/daily_16-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_17-11.md": {
	id: "noyabr/daily_17-11.md";
  slug: "noyabr/daily_17-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_18-11.md": {
	id: "noyabr/daily_18-11.md";
  slug: "noyabr/daily_18-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_19-11.md": {
	id: "noyabr/daily_19-11.md";
  slug: "noyabr/daily_19-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_20-11.md": {
	id: "noyabr/daily_20-11.md";
  slug: "noyabr/daily_20-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_21-11.md": {
	id: "noyabr/daily_21-11.md";
  slug: "noyabr/daily_21-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_22-11.md": {
	id: "noyabr/daily_22-11.md";
  slug: "noyabr/daily_22-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_23-11.md": {
	id: "noyabr/daily_23-11.md";
  slug: "noyabr/daily_23-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_24-11.md": {
	id: "noyabr/daily_24-11.md";
  slug: "noyabr/daily_24-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_25-11.md": {
	id: "noyabr/daily_25-11.md";
  slug: "noyabr/daily_25-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_26-11.md": {
	id: "noyabr/daily_26-11.md";
  slug: "noyabr/daily_26-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_27-11.md": {
	id: "noyabr/daily_27-11.md";
  slug: "noyabr/daily_27-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_28-11.md": {
	id: "noyabr/daily_28-11.md";
  slug: "noyabr/daily_28-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_29-11.md": {
	id: "noyabr/daily_29-11.md";
  slug: "noyabr/daily_29-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"noyabr/daily_30-11.md": {
	id: "noyabr/daily_30-11.md";
  slug: "noyabr/daily_30-11";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_01-10.md": {
	id: "oktyabr/daily_01-10.md";
  slug: "oktyabr/daily_01-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_02-10.md": {
	id: "oktyabr/daily_02-10.md";
  slug: "oktyabr/daily_02-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_03-10.md": {
	id: "oktyabr/daily_03-10.md";
  slug: "oktyabr/daily_03-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_04-10.md": {
	id: "oktyabr/daily_04-10.md";
  slug: "oktyabr/daily_04-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_05-10.md": {
	id: "oktyabr/daily_05-10.md";
  slug: "oktyabr/daily_05-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_06-10.md": {
	id: "oktyabr/daily_06-10.md";
  slug: "oktyabr/daily_06-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_07-10.md": {
	id: "oktyabr/daily_07-10.md";
  slug: "oktyabr/daily_07-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_08-10.md": {
	id: "oktyabr/daily_08-10.md";
  slug: "oktyabr/daily_08-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_09-10.md": {
	id: "oktyabr/daily_09-10.md";
  slug: "oktyabr/daily_09-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_10-10.md": {
	id: "oktyabr/daily_10-10.md";
  slug: "oktyabr/daily_10-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_11-10.md": {
	id: "oktyabr/daily_11-10.md";
  slug: "oktyabr/daily_11-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_12-10.md": {
	id: "oktyabr/daily_12-10.md";
  slug: "oktyabr/daily_12-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_13-10.md": {
	id: "oktyabr/daily_13-10.md";
  slug: "oktyabr/daily_13-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_14-10.md": {
	id: "oktyabr/daily_14-10.md";
  slug: "oktyabr/daily_14-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_15-10.md": {
	id: "oktyabr/daily_15-10.md";
  slug: "oktyabr/daily_15-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_16-10.md": {
	id: "oktyabr/daily_16-10.md";
  slug: "oktyabr/daily_16-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_17-10.md": {
	id: "oktyabr/daily_17-10.md";
  slug: "oktyabr/daily_17-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_18-10.md": {
	id: "oktyabr/daily_18-10.md";
  slug: "oktyabr/daily_18-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_19-10.md": {
	id: "oktyabr/daily_19-10.md";
  slug: "oktyabr/daily_19-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_20-10.md": {
	id: "oktyabr/daily_20-10.md";
  slug: "oktyabr/daily_20-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_21-10.md": {
	id: "oktyabr/daily_21-10.md";
  slug: "oktyabr/daily_21-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_22-10.md": {
	id: "oktyabr/daily_22-10.md";
  slug: "oktyabr/daily_22-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_23-10.md": {
	id: "oktyabr/daily_23-10.md";
  slug: "oktyabr/daily_23-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_24-10.md": {
	id: "oktyabr/daily_24-10.md";
  slug: "oktyabr/daily_24-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_25-10.md": {
	id: "oktyabr/daily_25-10.md";
  slug: "oktyabr/daily_25-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_26-10.md": {
	id: "oktyabr/daily_26-10.md";
  slug: "oktyabr/daily_26-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_27-10.md": {
	id: "oktyabr/daily_27-10.md";
  slug: "oktyabr/daily_27-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_28-10.md": {
	id: "oktyabr/daily_28-10.md";
  slug: "oktyabr/daily_28-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_29-10.md": {
	id: "oktyabr/daily_29-10.md";
  slug: "oktyabr/daily_29-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_30-10.md": {
	id: "oktyabr/daily_30-10.md";
  slug: "oktyabr/daily_30-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"oktyabr/daily_31-10.md": {
	id: "oktyabr/daily_31-10.md";
  slug: "oktyabr/daily_31-10";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_01-09.md": {
	id: "sentyabr/daily_01-09.md";
  slug: "sentyabr/daily_01-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_02-09.md": {
	id: "sentyabr/daily_02-09.md";
  slug: "sentyabr/daily_02-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_03-09.md": {
	id: "sentyabr/daily_03-09.md";
  slug: "sentyabr/daily_03-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_04-09.md": {
	id: "sentyabr/daily_04-09.md";
  slug: "sentyabr/daily_04-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_05-09.md": {
	id: "sentyabr/daily_05-09.md";
  slug: "sentyabr/daily_05-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_06-09.md": {
	id: "sentyabr/daily_06-09.md";
  slug: "sentyabr/daily_06-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_07-09.md": {
	id: "sentyabr/daily_07-09.md";
  slug: "sentyabr/daily_07-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_08-09.md": {
	id: "sentyabr/daily_08-09.md";
  slug: "sentyabr/daily_08-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_09-09.md": {
	id: "sentyabr/daily_09-09.md";
  slug: "sentyabr/daily_09-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_10-09.md": {
	id: "sentyabr/daily_10-09.md";
  slug: "sentyabr/daily_10-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_11-09.md": {
	id: "sentyabr/daily_11-09.md";
  slug: "sentyabr/daily_11-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_12-09.md": {
	id: "sentyabr/daily_12-09.md";
  slug: "sentyabr/daily_12-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_13-09.md": {
	id: "sentyabr/daily_13-09.md";
  slug: "sentyabr/daily_13-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_14-09.md": {
	id: "sentyabr/daily_14-09.md";
  slug: "sentyabr/daily_14-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_15-09.md": {
	id: "sentyabr/daily_15-09.md";
  slug: "sentyabr/daily_15-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_16-09.md": {
	id: "sentyabr/daily_16-09.md";
  slug: "sentyabr/daily_16-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_17-09.md": {
	id: "sentyabr/daily_17-09.md";
  slug: "sentyabr/daily_17-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_18-09.md": {
	id: "sentyabr/daily_18-09.md";
  slug: "sentyabr/daily_18-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_19-09.md": {
	id: "sentyabr/daily_19-09.md";
  slug: "sentyabr/daily_19-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_20-09.md": {
	id: "sentyabr/daily_20-09.md";
  slug: "sentyabr/daily_20-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_21-09.md": {
	id: "sentyabr/daily_21-09.md";
  slug: "sentyabr/daily_21-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_22-09.md": {
	id: "sentyabr/daily_22-09.md";
  slug: "sentyabr/daily_22-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_23-09.md": {
	id: "sentyabr/daily_23-09.md";
  slug: "sentyabr/daily_23-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_24-09.md": {
	id: "sentyabr/daily_24-09.md";
  slug: "sentyabr/daily_24-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_25-09.md": {
	id: "sentyabr/daily_25-09.md";
  slug: "sentyabr/daily_25-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_26-09.md": {
	id: "sentyabr/daily_26-09.md";
  slug: "sentyabr/daily_26-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_27-09.md": {
	id: "sentyabr/daily_27-09.md";
  slug: "sentyabr/daily_27-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_28-09.md": {
	id: "sentyabr/daily_28-09.md";
  slug: "sentyabr/daily_28-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_29-09.md": {
	id: "sentyabr/daily_29-09.md";
  slug: "sentyabr/daily_29-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"sentyabr/daily_30-09.md": {
	id: "sentyabr/daily_30-09.md";
  slug: "sentyabr/daily_30-09";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_01-01.md": {
	id: "yanvar/daily_01-01.md";
  slug: "yanvar/daily_01-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_02-01.md": {
	id: "yanvar/daily_02-01.md";
  slug: "yanvar/daily_02-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_03-01.md": {
	id: "yanvar/daily_03-01.md";
  slug: "yanvar/daily_03-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_04-01.md": {
	id: "yanvar/daily_04-01.md";
  slug: "yanvar/daily_04-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_05-01.md": {
	id: "yanvar/daily_05-01.md";
  slug: "yanvar/daily_05-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_06-01.md": {
	id: "yanvar/daily_06-01.md";
  slug: "yanvar/daily_06-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_07-01.md": {
	id: "yanvar/daily_07-01.md";
  slug: "yanvar/daily_07-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_08-01.md": {
	id: "yanvar/daily_08-01.md";
  slug: "yanvar/daily_08-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_09-01.md": {
	id: "yanvar/daily_09-01.md";
  slug: "yanvar/daily_09-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_10-01.md": {
	id: "yanvar/daily_10-01.md";
  slug: "yanvar/daily_10-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_11-01.md": {
	id: "yanvar/daily_11-01.md";
  slug: "yanvar/daily_11-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_12-01.md": {
	id: "yanvar/daily_12-01.md";
  slug: "yanvar/daily_12-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_13-01.md": {
	id: "yanvar/daily_13-01.md";
  slug: "yanvar/daily_13-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_14-01.md": {
	id: "yanvar/daily_14-01.md";
  slug: "yanvar/daily_14-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_15-01.md": {
	id: "yanvar/daily_15-01.md";
  slug: "yanvar/daily_15-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_16-01.md": {
	id: "yanvar/daily_16-01.md";
  slug: "yanvar/daily_16-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_17-01.md": {
	id: "yanvar/daily_17-01.md";
  slug: "yanvar/daily_17-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_18-01.md": {
	id: "yanvar/daily_18-01.md";
  slug: "yanvar/daily_18-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_19-01.md": {
	id: "yanvar/daily_19-01.md";
  slug: "yanvar/daily_19-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_20-01.md": {
	id: "yanvar/daily_20-01.md";
  slug: "yanvar/daily_20-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_21-01.md": {
	id: "yanvar/daily_21-01.md";
  slug: "yanvar/daily_21-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_22-01.md": {
	id: "yanvar/daily_22-01.md";
  slug: "yanvar/daily_22-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_23-01.md": {
	id: "yanvar/daily_23-01.md";
  slug: "yanvar/daily_23-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_24-01.md": {
	id: "yanvar/daily_24-01.md";
  slug: "yanvar/daily_24-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_25-01.md": {
	id: "yanvar/daily_25-01.md";
  slug: "yanvar/daily_25-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_26-01.md": {
	id: "yanvar/daily_26-01.md";
  slug: "yanvar/daily_26-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_27-01.md": {
	id: "yanvar/daily_27-01.md";
  slug: "yanvar/daily_27-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_28-01.md": {
	id: "yanvar/daily_28-01.md";
  slug: "yanvar/daily_28-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_29-01.md": {
	id: "yanvar/daily_29-01.md";
  slug: "yanvar/daily_29-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_30-01.md": {
	id: "yanvar/daily_30-01.md";
  slug: "yanvar/daily_30-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
"yanvar/daily_31-01.md": {
	id: "yanvar/daily_31-01.md";
  slug: "yanvar/daily_31-01";
  body: string;
  collection: "aadays";
  data: InferEntrySchema<"aadays">
} & { render(): Render[".md"] };
};
"alanon": {
"april/daily_01-04.md": {
	id: "april/daily_01-04.md";
  slug: "april/daily_01-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_02-04.md": {
	id: "april/daily_02-04.md";
  slug: "april/daily_02-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_03-04.md": {
	id: "april/daily_03-04.md";
  slug: "april/daily_03-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_04-04.md": {
	id: "april/daily_04-04.md";
  slug: "april/daily_04-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_05-04.md": {
	id: "april/daily_05-04.md";
  slug: "april/daily_05-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_06-04.md": {
	id: "april/daily_06-04.md";
  slug: "april/daily_06-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_07-04.md": {
	id: "april/daily_07-04.md";
  slug: "april/daily_07-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_08-04.md": {
	id: "april/daily_08-04.md";
  slug: "april/daily_08-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_09-04.md": {
	id: "april/daily_09-04.md";
  slug: "april/daily_09-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_10-04.md": {
	id: "april/daily_10-04.md";
  slug: "april/daily_10-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_11-04.md": {
	id: "april/daily_11-04.md";
  slug: "april/daily_11-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_12-04.md": {
	id: "april/daily_12-04.md";
  slug: "april/daily_12-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_13-04.md": {
	id: "april/daily_13-04.md";
  slug: "april/daily_13-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_14-04.md": {
	id: "april/daily_14-04.md";
  slug: "april/daily_14-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_15-04.md": {
	id: "april/daily_15-04.md";
  slug: "april/daily_15-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_16-04.md": {
	id: "april/daily_16-04.md";
  slug: "april/daily_16-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_17-04.md": {
	id: "april/daily_17-04.md";
  slug: "april/daily_17-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_18-04.md": {
	id: "april/daily_18-04.md";
  slug: "april/daily_18-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_19-04.md": {
	id: "april/daily_19-04.md";
  slug: "april/daily_19-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_20-04.md": {
	id: "april/daily_20-04.md";
  slug: "april/daily_20-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_21-04.md": {
	id: "april/daily_21-04.md";
  slug: "april/daily_21-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_22-04.md": {
	id: "april/daily_22-04.md";
  slug: "april/daily_22-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_23-04.md": {
	id: "april/daily_23-04.md";
  slug: "april/daily_23-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_24-04.md": {
	id: "april/daily_24-04.md";
  slug: "april/daily_24-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_25-04.md": {
	id: "april/daily_25-04.md";
  slug: "april/daily_25-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_26-04.md": {
	id: "april/daily_26-04.md";
  slug: "april/daily_26-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_27-04.md": {
	id: "april/daily_27-04.md";
  slug: "april/daily_27-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_28-04.md": {
	id: "april/daily_28-04.md";
  slug: "april/daily_28-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_29-04.md": {
	id: "april/daily_29-04.md";
  slug: "april/daily_29-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"april/daily_30-04.md": {
	id: "april/daily_30-04.md";
  slug: "april/daily_30-04";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_01-08.md": {
	id: "avgust/daily_01-08.md";
  slug: "avgust/daily_01-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_02-08.md": {
	id: "avgust/daily_02-08.md";
  slug: "avgust/daily_02-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_03-08.md": {
	id: "avgust/daily_03-08.md";
  slug: "avgust/daily_03-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_04-08.md": {
	id: "avgust/daily_04-08.md";
  slug: "avgust/daily_04-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_05-08.md": {
	id: "avgust/daily_05-08.md";
  slug: "avgust/daily_05-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_06-08.md": {
	id: "avgust/daily_06-08.md";
  slug: "avgust/daily_06-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_07-08.md": {
	id: "avgust/daily_07-08.md";
  slug: "avgust/daily_07-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_08-08.md": {
	id: "avgust/daily_08-08.md";
  slug: "avgust/daily_08-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_09-08.md": {
	id: "avgust/daily_09-08.md";
  slug: "avgust/daily_09-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_10-08.md": {
	id: "avgust/daily_10-08.md";
  slug: "avgust/daily_10-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_11-08.md": {
	id: "avgust/daily_11-08.md";
  slug: "avgust/daily_11-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_12-08.md": {
	id: "avgust/daily_12-08.md";
  slug: "avgust/daily_12-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_13-08.md": {
	id: "avgust/daily_13-08.md";
  slug: "avgust/daily_13-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_14-08.md": {
	id: "avgust/daily_14-08.md";
  slug: "avgust/daily_14-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_15-08.md": {
	id: "avgust/daily_15-08.md";
  slug: "avgust/daily_15-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_16-08.md": {
	id: "avgust/daily_16-08.md";
  slug: "avgust/daily_16-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_17-08.md": {
	id: "avgust/daily_17-08.md";
  slug: "avgust/daily_17-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_18-08.md": {
	id: "avgust/daily_18-08.md";
  slug: "avgust/daily_18-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_19-08.md": {
	id: "avgust/daily_19-08.md";
  slug: "avgust/daily_19-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_20-08.md": {
	id: "avgust/daily_20-08.md";
  slug: "avgust/daily_20-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_21-08.md": {
	id: "avgust/daily_21-08.md";
  slug: "avgust/daily_21-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_22-08.md": {
	id: "avgust/daily_22-08.md";
  slug: "avgust/daily_22-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_23-08.md": {
	id: "avgust/daily_23-08.md";
  slug: "avgust/daily_23-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_24-08.md": {
	id: "avgust/daily_24-08.md";
  slug: "avgust/daily_24-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_25-08.md": {
	id: "avgust/daily_25-08.md";
  slug: "avgust/daily_25-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_26-08.md": {
	id: "avgust/daily_26-08.md";
  slug: "avgust/daily_26-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_27-08.md": {
	id: "avgust/daily_27-08.md";
  slug: "avgust/daily_27-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_28-08.md": {
	id: "avgust/daily_28-08.md";
  slug: "avgust/daily_28-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_29-08.md": {
	id: "avgust/daily_29-08.md";
  slug: "avgust/daily_29-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_30-08.md": {
	id: "avgust/daily_30-08.md";
  slug: "avgust/daily_30-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"avgust/daily_31-08.md": {
	id: "avgust/daily_31-08.md";
  slug: "avgust/daily_31-08";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_01-12.md": {
	id: "dekabr/daily_01-12.md";
  slug: "dekabr/daily_01-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_02-12.md": {
	id: "dekabr/daily_02-12.md";
  slug: "dekabr/daily_02-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_03-12.md": {
	id: "dekabr/daily_03-12.md";
  slug: "dekabr/daily_03-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_04-12.md": {
	id: "dekabr/daily_04-12.md";
  slug: "dekabr/daily_04-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_05-12.md": {
	id: "dekabr/daily_05-12.md";
  slug: "dekabr/daily_05-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_06-12.md": {
	id: "dekabr/daily_06-12.md";
  slug: "dekabr/daily_06-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_07-12.md": {
	id: "dekabr/daily_07-12.md";
  slug: "dekabr/daily_07-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_08-12.md": {
	id: "dekabr/daily_08-12.md";
  slug: "dekabr/daily_08-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_09-12.md": {
	id: "dekabr/daily_09-12.md";
  slug: "dekabr/daily_09-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_10-12.md": {
	id: "dekabr/daily_10-12.md";
  slug: "dekabr/daily_10-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_11-12.md": {
	id: "dekabr/daily_11-12.md";
  slug: "dekabr/daily_11-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_12-12.md": {
	id: "dekabr/daily_12-12.md";
  slug: "dekabr/daily_12-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_13-12.md": {
	id: "dekabr/daily_13-12.md";
  slug: "dekabr/daily_13-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_14-12.md": {
	id: "dekabr/daily_14-12.md";
  slug: "dekabr/daily_14-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_15-12.md": {
	id: "dekabr/daily_15-12.md";
  slug: "dekabr/daily_15-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_16-12.md": {
	id: "dekabr/daily_16-12.md";
  slug: "dekabr/daily_16-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_17-12.md": {
	id: "dekabr/daily_17-12.md";
  slug: "dekabr/daily_17-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_18-12.md": {
	id: "dekabr/daily_18-12.md";
  slug: "dekabr/daily_18-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_19-12.md": {
	id: "dekabr/daily_19-12.md";
  slug: "dekabr/daily_19-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_20-12.md": {
	id: "dekabr/daily_20-12.md";
  slug: "dekabr/daily_20-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_21-12.md": {
	id: "dekabr/daily_21-12.md";
  slug: "dekabr/daily_21-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_22-12.md": {
	id: "dekabr/daily_22-12.md";
  slug: "dekabr/daily_22-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_23-12.md": {
	id: "dekabr/daily_23-12.md";
  slug: "dekabr/daily_23-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_24-12.md": {
	id: "dekabr/daily_24-12.md";
  slug: "dekabr/daily_24-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_25-12.md": {
	id: "dekabr/daily_25-12.md";
  slug: "dekabr/daily_25-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_26-12.md": {
	id: "dekabr/daily_26-12.md";
  slug: "dekabr/daily_26-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_27-12.md": {
	id: "dekabr/daily_27-12.md";
  slug: "dekabr/daily_27-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_28-12.md": {
	id: "dekabr/daily_28-12.md";
  slug: "dekabr/daily_28-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_29-12.md": {
	id: "dekabr/daily_29-12.md";
  slug: "dekabr/daily_29-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_30-12.md": {
	id: "dekabr/daily_30-12.md";
  slug: "dekabr/daily_30-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"dekabr/daily_31-12.md": {
	id: "dekabr/daily_31-12.md";
  slug: "dekabr/daily_31-12";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_01-02.md": {
	id: "fevral/daily_01-02.md";
  slug: "fevral/daily_01-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_02-02.md": {
	id: "fevral/daily_02-02.md";
  slug: "fevral/daily_02-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_03-02.md": {
	id: "fevral/daily_03-02.md";
  slug: "fevral/daily_03-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_04-02.md": {
	id: "fevral/daily_04-02.md";
  slug: "fevral/daily_04-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_05-02.md": {
	id: "fevral/daily_05-02.md";
  slug: "fevral/daily_05-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_06-02.md": {
	id: "fevral/daily_06-02.md";
  slug: "fevral/daily_06-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_07-02.md": {
	id: "fevral/daily_07-02.md";
  slug: "fevral/daily_07-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_08-02.md": {
	id: "fevral/daily_08-02.md";
  slug: "fevral/daily_08-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_09-02.md": {
	id: "fevral/daily_09-02.md";
  slug: "fevral/daily_09-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_10-02.md": {
	id: "fevral/daily_10-02.md";
  slug: "fevral/daily_10-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_11-02.md": {
	id: "fevral/daily_11-02.md";
  slug: "fevral/daily_11-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_12-02.md": {
	id: "fevral/daily_12-02.md";
  slug: "fevral/daily_12-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_13-02.md": {
	id: "fevral/daily_13-02.md";
  slug: "fevral/daily_13-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_14-02.md": {
	id: "fevral/daily_14-02.md";
  slug: "fevral/daily_14-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_15-02.md": {
	id: "fevral/daily_15-02.md";
  slug: "fevral/daily_15-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_16-02.md": {
	id: "fevral/daily_16-02.md";
  slug: "fevral/daily_16-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_17-02.md": {
	id: "fevral/daily_17-02.md";
  slug: "fevral/daily_17-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_18-02.md": {
	id: "fevral/daily_18-02.md";
  slug: "fevral/daily_18-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_19-02.md": {
	id: "fevral/daily_19-02.md";
  slug: "fevral/daily_19-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_20-02.md": {
	id: "fevral/daily_20-02.md";
  slug: "fevral/daily_20-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_21-02.md": {
	id: "fevral/daily_21-02.md";
  slug: "fevral/daily_21-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_22-02.md": {
	id: "fevral/daily_22-02.md";
  slug: "fevral/daily_22-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_23-02.md": {
	id: "fevral/daily_23-02.md";
  slug: "fevral/daily_23-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_24-02.md": {
	id: "fevral/daily_24-02.md";
  slug: "fevral/daily_24-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_25-02.md": {
	id: "fevral/daily_25-02.md";
  slug: "fevral/daily_25-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_26-02.md": {
	id: "fevral/daily_26-02.md";
  slug: "fevral/daily_26-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_27-02.md": {
	id: "fevral/daily_27-02.md";
  slug: "fevral/daily_27-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_28-02.md": {
	id: "fevral/daily_28-02.md";
  slug: "fevral/daily_28-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"fevral/daily_29-02.md": {
	id: "fevral/daily_29-02.md";
  slug: "fevral/daily_29-02";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_01-07.md": {
	id: "iyul/daily_01-07.md";
  slug: "iyul/daily_01-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_02-07.md": {
	id: "iyul/daily_02-07.md";
  slug: "iyul/daily_02-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_03-07.md": {
	id: "iyul/daily_03-07.md";
  slug: "iyul/daily_03-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_04-07.md": {
	id: "iyul/daily_04-07.md";
  slug: "iyul/daily_04-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_05-07.md": {
	id: "iyul/daily_05-07.md";
  slug: "iyul/daily_05-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_06-07.md": {
	id: "iyul/daily_06-07.md";
  slug: "iyul/daily_06-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_07-07.md": {
	id: "iyul/daily_07-07.md";
  slug: "iyul/daily_07-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_08-07.md": {
	id: "iyul/daily_08-07.md";
  slug: "iyul/daily_08-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_09-07.md": {
	id: "iyul/daily_09-07.md";
  slug: "iyul/daily_09-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_10-07.md": {
	id: "iyul/daily_10-07.md";
  slug: "iyul/daily_10-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_11-07.md": {
	id: "iyul/daily_11-07.md";
  slug: "iyul/daily_11-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_12-07.md": {
	id: "iyul/daily_12-07.md";
  slug: "iyul/daily_12-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_13-07.md": {
	id: "iyul/daily_13-07.md";
  slug: "iyul/daily_13-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_14-07.md": {
	id: "iyul/daily_14-07.md";
  slug: "iyul/daily_14-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_15-07.md": {
	id: "iyul/daily_15-07.md";
  slug: "iyul/daily_15-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_16-07.md": {
	id: "iyul/daily_16-07.md";
  slug: "iyul/daily_16-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_17-07.md": {
	id: "iyul/daily_17-07.md";
  slug: "iyul/daily_17-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_18-07.md": {
	id: "iyul/daily_18-07.md";
  slug: "iyul/daily_18-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_19-07.md": {
	id: "iyul/daily_19-07.md";
  slug: "iyul/daily_19-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_20-07.md": {
	id: "iyul/daily_20-07.md";
  slug: "iyul/daily_20-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_21-07.md": {
	id: "iyul/daily_21-07.md";
  slug: "iyul/daily_21-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_22-07.md": {
	id: "iyul/daily_22-07.md";
  slug: "iyul/daily_22-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_23-07.md": {
	id: "iyul/daily_23-07.md";
  slug: "iyul/daily_23-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_24-07.md": {
	id: "iyul/daily_24-07.md";
  slug: "iyul/daily_24-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_25-07.md": {
	id: "iyul/daily_25-07.md";
  slug: "iyul/daily_25-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_26-07.md": {
	id: "iyul/daily_26-07.md";
  slug: "iyul/daily_26-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_27-07.md": {
	id: "iyul/daily_27-07.md";
  slug: "iyul/daily_27-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_28-07.md": {
	id: "iyul/daily_28-07.md";
  slug: "iyul/daily_28-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_29-07.md": {
	id: "iyul/daily_29-07.md";
  slug: "iyul/daily_29-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_30-07.md": {
	id: "iyul/daily_30-07.md";
  slug: "iyul/daily_30-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyul/daily_31-07.md": {
	id: "iyul/daily_31-07.md";
  slug: "iyul/daily_31-07";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_01-06.md": {
	id: "iyun/daily_01-06.md";
  slug: "iyun/daily_01-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_02-06.md": {
	id: "iyun/daily_02-06.md";
  slug: "iyun/daily_02-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_03-06.md": {
	id: "iyun/daily_03-06.md";
  slug: "iyun/daily_03-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_04-06.md": {
	id: "iyun/daily_04-06.md";
  slug: "iyun/daily_04-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_05-06.md": {
	id: "iyun/daily_05-06.md";
  slug: "iyun/daily_05-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_06-06.md": {
	id: "iyun/daily_06-06.md";
  slug: "iyun/daily_06-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_07-06.md": {
	id: "iyun/daily_07-06.md";
  slug: "iyun/daily_07-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_08-06.md": {
	id: "iyun/daily_08-06.md";
  slug: "iyun/daily_08-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_09-06.md": {
	id: "iyun/daily_09-06.md";
  slug: "iyun/daily_09-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_10-06.md": {
	id: "iyun/daily_10-06.md";
  slug: "iyun/daily_10-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_11-06.md": {
	id: "iyun/daily_11-06.md";
  slug: "iyun/daily_11-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_12-06.md": {
	id: "iyun/daily_12-06.md";
  slug: "iyun/daily_12-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_13-06.md": {
	id: "iyun/daily_13-06.md";
  slug: "iyun/daily_13-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_14-06.md": {
	id: "iyun/daily_14-06.md";
  slug: "iyun/daily_14-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_15-06.md": {
	id: "iyun/daily_15-06.md";
  slug: "iyun/daily_15-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_16-06.md": {
	id: "iyun/daily_16-06.md";
  slug: "iyun/daily_16-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_17-06.md": {
	id: "iyun/daily_17-06.md";
  slug: "iyun/daily_17-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_18-06.md": {
	id: "iyun/daily_18-06.md";
  slug: "iyun/daily_18-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_19-06.md": {
	id: "iyun/daily_19-06.md";
  slug: "iyun/daily_19-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_20-06.md": {
	id: "iyun/daily_20-06.md";
  slug: "iyun/daily_20-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_21-06.md": {
	id: "iyun/daily_21-06.md";
  slug: "iyun/daily_21-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_22-06.md": {
	id: "iyun/daily_22-06.md";
  slug: "iyun/daily_22-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_23-06.md": {
	id: "iyun/daily_23-06.md";
  slug: "iyun/daily_23-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_24-06.md": {
	id: "iyun/daily_24-06.md";
  slug: "iyun/daily_24-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_25-06.md": {
	id: "iyun/daily_25-06.md";
  slug: "iyun/daily_25-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_26-06.md": {
	id: "iyun/daily_26-06.md";
  slug: "iyun/daily_26-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_27-06.md": {
	id: "iyun/daily_27-06.md";
  slug: "iyun/daily_27-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_28-06.md": {
	id: "iyun/daily_28-06.md";
  slug: "iyun/daily_28-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_29-06.md": {
	id: "iyun/daily_29-06.md";
  slug: "iyun/daily_29-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"iyun/daily_30-06.md": {
	id: "iyun/daily_30-06.md";
  slug: "iyun/daily_30-06";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_01-05.md": {
	id: "maj/daily_01-05.md";
  slug: "maj/daily_01-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_02-05.md": {
	id: "maj/daily_02-05.md";
  slug: "maj/daily_02-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_03-05.md": {
	id: "maj/daily_03-05.md";
  slug: "maj/daily_03-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_04-05.md": {
	id: "maj/daily_04-05.md";
  slug: "maj/daily_04-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_05-05.md": {
	id: "maj/daily_05-05.md";
  slug: "maj/daily_05-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_06-05.md": {
	id: "maj/daily_06-05.md";
  slug: "maj/daily_06-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_07-05.md": {
	id: "maj/daily_07-05.md";
  slug: "maj/daily_07-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_08-05.md": {
	id: "maj/daily_08-05.md";
  slug: "maj/daily_08-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_09-05.md": {
	id: "maj/daily_09-05.md";
  slug: "maj/daily_09-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_10-05.md": {
	id: "maj/daily_10-05.md";
  slug: "maj/daily_10-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_11-05.md": {
	id: "maj/daily_11-05.md";
  slug: "maj/daily_11-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_12-05.md": {
	id: "maj/daily_12-05.md";
  slug: "maj/daily_12-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_13-05.md": {
	id: "maj/daily_13-05.md";
  slug: "maj/daily_13-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_14-05.md": {
	id: "maj/daily_14-05.md";
  slug: "maj/daily_14-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_15-05.md": {
	id: "maj/daily_15-05.md";
  slug: "maj/daily_15-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_16-05.md": {
	id: "maj/daily_16-05.md";
  slug: "maj/daily_16-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_17-05.md": {
	id: "maj/daily_17-05.md";
  slug: "maj/daily_17-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_18-05.md": {
	id: "maj/daily_18-05.md";
  slug: "maj/daily_18-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_19-05.md": {
	id: "maj/daily_19-05.md";
  slug: "maj/daily_19-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_20-05.md": {
	id: "maj/daily_20-05.md";
  slug: "maj/daily_20-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_21-05.md": {
	id: "maj/daily_21-05.md";
  slug: "maj/daily_21-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_22-05.md": {
	id: "maj/daily_22-05.md";
  slug: "maj/daily_22-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_23-05.md": {
	id: "maj/daily_23-05.md";
  slug: "maj/daily_23-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_24-05.md": {
	id: "maj/daily_24-05.md";
  slug: "maj/daily_24-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_25-05.md": {
	id: "maj/daily_25-05.md";
  slug: "maj/daily_25-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_26-05.md": {
	id: "maj/daily_26-05.md";
  slug: "maj/daily_26-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_27-05.md": {
	id: "maj/daily_27-05.md";
  slug: "maj/daily_27-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_28-05.md": {
	id: "maj/daily_28-05.md";
  slug: "maj/daily_28-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_29-05.md": {
	id: "maj/daily_29-05.md";
  slug: "maj/daily_29-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_30-05.md": {
	id: "maj/daily_30-05.md";
  slug: "maj/daily_30-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"maj/daily_31-05.md": {
	id: "maj/daily_31-05.md";
  slug: "maj/daily_31-05";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_01-03.md": {
	id: "mart/daily_01-03.md";
  slug: "mart/daily_01-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_02-03.md": {
	id: "mart/daily_02-03.md";
  slug: "mart/daily_02-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_03-03.md": {
	id: "mart/daily_03-03.md";
  slug: "mart/daily_03-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_04-03.md": {
	id: "mart/daily_04-03.md";
  slug: "mart/daily_04-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_05-03.md": {
	id: "mart/daily_05-03.md";
  slug: "mart/daily_05-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_06-03.md": {
	id: "mart/daily_06-03.md";
  slug: "mart/daily_06-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_07-03.md": {
	id: "mart/daily_07-03.md";
  slug: "mart/daily_07-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_08-03.md": {
	id: "mart/daily_08-03.md";
  slug: "mart/daily_08-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_09-03.md": {
	id: "mart/daily_09-03.md";
  slug: "mart/daily_09-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_10-03.md": {
	id: "mart/daily_10-03.md";
  slug: "mart/daily_10-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_11-03.md": {
	id: "mart/daily_11-03.md";
  slug: "mart/daily_11-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_12-03.md": {
	id: "mart/daily_12-03.md";
  slug: "mart/daily_12-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_13-03.md": {
	id: "mart/daily_13-03.md";
  slug: "mart/daily_13-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_14-03.md": {
	id: "mart/daily_14-03.md";
  slug: "mart/daily_14-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_15-03.md": {
	id: "mart/daily_15-03.md";
  slug: "mart/daily_15-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_16-03.md": {
	id: "mart/daily_16-03.md";
  slug: "mart/daily_16-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_17-03.md": {
	id: "mart/daily_17-03.md";
  slug: "mart/daily_17-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_18-03.md": {
	id: "mart/daily_18-03.md";
  slug: "mart/daily_18-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_19-03.md": {
	id: "mart/daily_19-03.md";
  slug: "mart/daily_19-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_20-03.md": {
	id: "mart/daily_20-03.md";
  slug: "mart/daily_20-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_21-03.md": {
	id: "mart/daily_21-03.md";
  slug: "mart/daily_21-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_22-03.md": {
	id: "mart/daily_22-03.md";
  slug: "mart/daily_22-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_23-03.md": {
	id: "mart/daily_23-03.md";
  slug: "mart/daily_23-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_24-03.md": {
	id: "mart/daily_24-03.md";
  slug: "mart/daily_24-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_25-03.md": {
	id: "mart/daily_25-03.md";
  slug: "mart/daily_25-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_26-03.md": {
	id: "mart/daily_26-03.md";
  slug: "mart/daily_26-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_27-03.md": {
	id: "mart/daily_27-03.md";
  slug: "mart/daily_27-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_28-03.md": {
	id: "mart/daily_28-03.md";
  slug: "mart/daily_28-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_29-03.md": {
	id: "mart/daily_29-03.md";
  slug: "mart/daily_29-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_30-03.md": {
	id: "mart/daily_30-03.md";
  slug: "mart/daily_30-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"mart/daily_31-03.md": {
	id: "mart/daily_31-03.md";
  slug: "mart/daily_31-03";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_01-11.md": {
	id: "noyabr/daily_01-11.md";
  slug: "noyabr/daily_01-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_02-11.md": {
	id: "noyabr/daily_02-11.md";
  slug: "noyabr/daily_02-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_03-11.md": {
	id: "noyabr/daily_03-11.md";
  slug: "noyabr/daily_03-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_04-11.md": {
	id: "noyabr/daily_04-11.md";
  slug: "noyabr/daily_04-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_05-11.md": {
	id: "noyabr/daily_05-11.md";
  slug: "noyabr/daily_05-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_06-11.md": {
	id: "noyabr/daily_06-11.md";
  slug: "noyabr/daily_06-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_07-11.md": {
	id: "noyabr/daily_07-11.md";
  slug: "noyabr/daily_07-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_08-11.md": {
	id: "noyabr/daily_08-11.md";
  slug: "noyabr/daily_08-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_09-11.md": {
	id: "noyabr/daily_09-11.md";
  slug: "noyabr/daily_09-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_10-11.md": {
	id: "noyabr/daily_10-11.md";
  slug: "noyabr/daily_10-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_11-11.md": {
	id: "noyabr/daily_11-11.md";
  slug: "noyabr/daily_11-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_12-11.md": {
	id: "noyabr/daily_12-11.md";
  slug: "noyabr/daily_12-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_13-11.md": {
	id: "noyabr/daily_13-11.md";
  slug: "noyabr/daily_13-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_14-11.md": {
	id: "noyabr/daily_14-11.md";
  slug: "noyabr/daily_14-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_15-11.md": {
	id: "noyabr/daily_15-11.md";
  slug: "noyabr/daily_15-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_16-11.md": {
	id: "noyabr/daily_16-11.md";
  slug: "noyabr/daily_16-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_17-11.md": {
	id: "noyabr/daily_17-11.md";
  slug: "noyabr/daily_17-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_18-11.md": {
	id: "noyabr/daily_18-11.md";
  slug: "noyabr/daily_18-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_19-11.md": {
	id: "noyabr/daily_19-11.md";
  slug: "noyabr/daily_19-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_20-11.md": {
	id: "noyabr/daily_20-11.md";
  slug: "noyabr/daily_20-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_21-11.md": {
	id: "noyabr/daily_21-11.md";
  slug: "noyabr/daily_21-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_22-11.md": {
	id: "noyabr/daily_22-11.md";
  slug: "noyabr/daily_22-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_23-11.md": {
	id: "noyabr/daily_23-11.md";
  slug: "noyabr/daily_23-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_24-11.md": {
	id: "noyabr/daily_24-11.md";
  slug: "noyabr/daily_24-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_25-11.md": {
	id: "noyabr/daily_25-11.md";
  slug: "noyabr/daily_25-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_26-11.md": {
	id: "noyabr/daily_26-11.md";
  slug: "noyabr/daily_26-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_27-11.md": {
	id: "noyabr/daily_27-11.md";
  slug: "noyabr/daily_27-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_28-11.md": {
	id: "noyabr/daily_28-11.md";
  slug: "noyabr/daily_28-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_29-11.md": {
	id: "noyabr/daily_29-11.md";
  slug: "noyabr/daily_29-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"noyabr/daily_30-11.md": {
	id: "noyabr/daily_30-11.md";
  slug: "noyabr/daily_30-11";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_01-10.md": {
	id: "oktyabr/daily_01-10.md";
  slug: "oktyabr/daily_01-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_02-10.md": {
	id: "oktyabr/daily_02-10.md";
  slug: "oktyabr/daily_02-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_03-10.md": {
	id: "oktyabr/daily_03-10.md";
  slug: "oktyabr/daily_03-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_04-10.md": {
	id: "oktyabr/daily_04-10.md";
  slug: "oktyabr/daily_04-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_05-10.md": {
	id: "oktyabr/daily_05-10.md";
  slug: "oktyabr/daily_05-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_06-10.md": {
	id: "oktyabr/daily_06-10.md";
  slug: "oktyabr/daily_06-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_07-10.md": {
	id: "oktyabr/daily_07-10.md";
  slug: "oktyabr/daily_07-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_08-10.md": {
	id: "oktyabr/daily_08-10.md";
  slug: "oktyabr/daily_08-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_09-10.md": {
	id: "oktyabr/daily_09-10.md";
  slug: "oktyabr/daily_09-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_10-10.md": {
	id: "oktyabr/daily_10-10.md";
  slug: "oktyabr/daily_10-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_11-10.md": {
	id: "oktyabr/daily_11-10.md";
  slug: "oktyabr/daily_11-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_12-10.md": {
	id: "oktyabr/daily_12-10.md";
  slug: "oktyabr/daily_12-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_13-10.md": {
	id: "oktyabr/daily_13-10.md";
  slug: "oktyabr/daily_13-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_14-10.md": {
	id: "oktyabr/daily_14-10.md";
  slug: "oktyabr/daily_14-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_15-10.md": {
	id: "oktyabr/daily_15-10.md";
  slug: "oktyabr/daily_15-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_16-10.md": {
	id: "oktyabr/daily_16-10.md";
  slug: "oktyabr/daily_16-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_17-10.md": {
	id: "oktyabr/daily_17-10.md";
  slug: "oktyabr/daily_17-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_18-10.md": {
	id: "oktyabr/daily_18-10.md";
  slug: "oktyabr/daily_18-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_19-10.md": {
	id: "oktyabr/daily_19-10.md";
  slug: "oktyabr/daily_19-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_20-10.md": {
	id: "oktyabr/daily_20-10.md";
  slug: "oktyabr/daily_20-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_21-10.md": {
	id: "oktyabr/daily_21-10.md";
  slug: "oktyabr/daily_21-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_22-10.md": {
	id: "oktyabr/daily_22-10.md";
  slug: "oktyabr/daily_22-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_23-10.md": {
	id: "oktyabr/daily_23-10.md";
  slug: "oktyabr/daily_23-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_24-10.md": {
	id: "oktyabr/daily_24-10.md";
  slug: "oktyabr/daily_24-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_25-10.md": {
	id: "oktyabr/daily_25-10.md";
  slug: "oktyabr/daily_25-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_26-10.md": {
	id: "oktyabr/daily_26-10.md";
  slug: "oktyabr/daily_26-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_27-10.md": {
	id: "oktyabr/daily_27-10.md";
  slug: "oktyabr/daily_27-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_28-10.md": {
	id: "oktyabr/daily_28-10.md";
  slug: "oktyabr/daily_28-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_29-10.md": {
	id: "oktyabr/daily_29-10.md";
  slug: "oktyabr/daily_29-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_30-10.md": {
	id: "oktyabr/daily_30-10.md";
  slug: "oktyabr/daily_30-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"oktyabr/daily_31-10.md": {
	id: "oktyabr/daily_31-10.md";
  slug: "oktyabr/daily_31-10";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_01-09.md": {
	id: "sentyabr/daily_01-09.md";
  slug: "sentyabr/daily_01-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_02-09.md": {
	id: "sentyabr/daily_02-09.md";
  slug: "sentyabr/daily_02-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_03-09.md": {
	id: "sentyabr/daily_03-09.md";
  slug: "sentyabr/daily_03-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_04-09.md": {
	id: "sentyabr/daily_04-09.md";
  slug: "sentyabr/daily_04-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_05-09.md": {
	id: "sentyabr/daily_05-09.md";
  slug: "sentyabr/daily_05-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_06-09.md": {
	id: "sentyabr/daily_06-09.md";
  slug: "sentyabr/daily_06-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_07-09.md": {
	id: "sentyabr/daily_07-09.md";
  slug: "sentyabr/daily_07-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_08-09.md": {
	id: "sentyabr/daily_08-09.md";
  slug: "sentyabr/daily_08-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_09-09.md": {
	id: "sentyabr/daily_09-09.md";
  slug: "sentyabr/daily_09-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_10-09.md": {
	id: "sentyabr/daily_10-09.md";
  slug: "sentyabr/daily_10-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_11-09.md": {
	id: "sentyabr/daily_11-09.md";
  slug: "sentyabr/daily_11-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_12-09.md": {
	id: "sentyabr/daily_12-09.md";
  slug: "sentyabr/daily_12-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_13-09.md": {
	id: "sentyabr/daily_13-09.md";
  slug: "sentyabr/daily_13-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_14-09.md": {
	id: "sentyabr/daily_14-09.md";
  slug: "sentyabr/daily_14-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_15-09.md": {
	id: "sentyabr/daily_15-09.md";
  slug: "sentyabr/daily_15-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_16-09.md": {
	id: "sentyabr/daily_16-09.md";
  slug: "sentyabr/daily_16-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_17-09.md": {
	id: "sentyabr/daily_17-09.md";
  slug: "sentyabr/daily_17-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_18-09.md": {
	id: "sentyabr/daily_18-09.md";
  slug: "sentyabr/daily_18-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_19-09.md": {
	id: "sentyabr/daily_19-09.md";
  slug: "sentyabr/daily_19-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_20-09.md": {
	id: "sentyabr/daily_20-09.md";
  slug: "sentyabr/daily_20-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_21-09.md": {
	id: "sentyabr/daily_21-09.md";
  slug: "sentyabr/daily_21-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_22-09.md": {
	id: "sentyabr/daily_22-09.md";
  slug: "sentyabr/daily_22-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_23-09.md": {
	id: "sentyabr/daily_23-09.md";
  slug: "sentyabr/daily_23-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_24-09.md": {
	id: "sentyabr/daily_24-09.md";
  slug: "sentyabr/daily_24-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_25-09.md": {
	id: "sentyabr/daily_25-09.md";
  slug: "sentyabr/daily_25-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_26-09.md": {
	id: "sentyabr/daily_26-09.md";
  slug: "sentyabr/daily_26-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_27-09.md": {
	id: "sentyabr/daily_27-09.md";
  slug: "sentyabr/daily_27-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_28-09.md": {
	id: "sentyabr/daily_28-09.md";
  slug: "sentyabr/daily_28-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_29-09.md": {
	id: "sentyabr/daily_29-09.md";
  slug: "sentyabr/daily_29-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"sentyabr/daily_30-09.md": {
	id: "sentyabr/daily_30-09.md";
  slug: "sentyabr/daily_30-09";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_01-01.md": {
	id: "yanvar/daily_01-01.md";
  slug: "yanvar/daily_01-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_02-01.md": {
	id: "yanvar/daily_02-01.md";
  slug: "yanvar/daily_02-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_03-01.md": {
	id: "yanvar/daily_03-01.md";
  slug: "yanvar/daily_03-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_04-01.md": {
	id: "yanvar/daily_04-01.md";
  slug: "yanvar/daily_04-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_05-01.md": {
	id: "yanvar/daily_05-01.md";
  slug: "yanvar/daily_05-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_06-01.md": {
	id: "yanvar/daily_06-01.md";
  slug: "yanvar/daily_06-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_07-01.md": {
	id: "yanvar/daily_07-01.md";
  slug: "yanvar/daily_07-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_08-01.md": {
	id: "yanvar/daily_08-01.md";
  slug: "yanvar/daily_08-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_09-01.md": {
	id: "yanvar/daily_09-01.md";
  slug: "yanvar/daily_09-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_10-01.md": {
	id: "yanvar/daily_10-01.md";
  slug: "yanvar/daily_10-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_11-01.md": {
	id: "yanvar/daily_11-01.md";
  slug: "yanvar/daily_11-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_12-01.md": {
	id: "yanvar/daily_12-01.md";
  slug: "yanvar/daily_12-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_13-01.md": {
	id: "yanvar/daily_13-01.md";
  slug: "yanvar/daily_13-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_14-01.md": {
	id: "yanvar/daily_14-01.md";
  slug: "yanvar/daily_14-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_15-01.md": {
	id: "yanvar/daily_15-01.md";
  slug: "yanvar/daily_15-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_16-01.md": {
	id: "yanvar/daily_16-01.md";
  slug: "yanvar/daily_16-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_17-01.md": {
	id: "yanvar/daily_17-01.md";
  slug: "yanvar/daily_17-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_18-01.md": {
	id: "yanvar/daily_18-01.md";
  slug: "yanvar/daily_18-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_19-01.md": {
	id: "yanvar/daily_19-01.md";
  slug: "yanvar/daily_19-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_20-01.md": {
	id: "yanvar/daily_20-01.md";
  slug: "yanvar/daily_20-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_21-01.md": {
	id: "yanvar/daily_21-01.md";
  slug: "yanvar/daily_21-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_22-01.md": {
	id: "yanvar/daily_22-01.md";
  slug: "yanvar/daily_22-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_23-01.md": {
	id: "yanvar/daily_23-01.md";
  slug: "yanvar/daily_23-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_24-01.md": {
	id: "yanvar/daily_24-01.md";
  slug: "yanvar/daily_24-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_25-01.md": {
	id: "yanvar/daily_25-01.md";
  slug: "yanvar/daily_25-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_26-01.md": {
	id: "yanvar/daily_26-01.md";
  slug: "yanvar/daily_26-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_27-01.md": {
	id: "yanvar/daily_27-01.md";
  slug: "yanvar/daily_27-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_28-01.md": {
	id: "yanvar/daily_28-01.md";
  slug: "yanvar/daily_28-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_29-01.md": {
	id: "yanvar/daily_29-01.md";
  slug: "yanvar/daily_29-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_30-01.md": {
	id: "yanvar/daily_30-01.md";
  slug: "yanvar/daily_30-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
"yanvar/daily_31-01.md": {
	id: "yanvar/daily_31-01.md";
  slug: "yanvar/daily_31-01";
  body: string;
  collection: "alanon";
  data: InferEntrySchema<"alanon">
} & { render(): Render[".md"] };
};
"alanonmm": {
"april/daily_01-04.md": {
	id: "april/daily_01-04.md";
  slug: "april/daily_01-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_02-04.md": {
	id: "april/daily_02-04.md";
  slug: "april/daily_02-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_03-04.md": {
	id: "april/daily_03-04.md";
  slug: "april/daily_03-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_04-04.md": {
	id: "april/daily_04-04.md";
  slug: "april/daily_04-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_05-04.md": {
	id: "april/daily_05-04.md";
  slug: "april/daily_05-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_06-04.md": {
	id: "april/daily_06-04.md";
  slug: "april/daily_06-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_07-04.md": {
	id: "april/daily_07-04.md";
  slug: "april/daily_07-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_08-04.md": {
	id: "april/daily_08-04.md";
  slug: "april/daily_08-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_09-04.md": {
	id: "april/daily_09-04.md";
  slug: "april/daily_09-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_10-04.md": {
	id: "april/daily_10-04.md";
  slug: "april/daily_10-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_11-04.md": {
	id: "april/daily_11-04.md";
  slug: "april/daily_11-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_12-04.md": {
	id: "april/daily_12-04.md";
  slug: "april/daily_12-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_13-04.md": {
	id: "april/daily_13-04.md";
  slug: "april/daily_13-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_14-04.md": {
	id: "april/daily_14-04.md";
  slug: "april/daily_14-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_15-04.md": {
	id: "april/daily_15-04.md";
  slug: "april/daily_15-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_16-04.md": {
	id: "april/daily_16-04.md";
  slug: "april/daily_16-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_17-04.md": {
	id: "april/daily_17-04.md";
  slug: "april/daily_17-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_18-04.md": {
	id: "april/daily_18-04.md";
  slug: "april/daily_18-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_19-04.md": {
	id: "april/daily_19-04.md";
  slug: "april/daily_19-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_20-04.md": {
	id: "april/daily_20-04.md";
  slug: "april/daily_20-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_21-04.md": {
	id: "april/daily_21-04.md";
  slug: "april/daily_21-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_22-04.md": {
	id: "april/daily_22-04.md";
  slug: "april/daily_22-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_23-04.md": {
	id: "april/daily_23-04.md";
  slug: "april/daily_23-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_24-04.md": {
	id: "april/daily_24-04.md";
  slug: "april/daily_24-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_25-04.md": {
	id: "april/daily_25-04.md";
  slug: "april/daily_25-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_26-04.md": {
	id: "april/daily_26-04.md";
  slug: "april/daily_26-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_27-04.md": {
	id: "april/daily_27-04.md";
  slug: "april/daily_27-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_28-04.md": {
	id: "april/daily_28-04.md";
  slug: "april/daily_28-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_29-04.md": {
	id: "april/daily_29-04.md";
  slug: "april/daily_29-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"april/daily_30-04.md": {
	id: "april/daily_30-04.md";
  slug: "april/daily_30-04";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_01-08.md": {
	id: "avgust/daily_01-08.md";
  slug: "avgust/daily_01-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_02-08.md": {
	id: "avgust/daily_02-08.md";
  slug: "avgust/daily_02-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_03-08.md": {
	id: "avgust/daily_03-08.md";
  slug: "avgust/daily_03-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_04-08.md": {
	id: "avgust/daily_04-08.md";
  slug: "avgust/daily_04-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_05-08.md": {
	id: "avgust/daily_05-08.md";
  slug: "avgust/daily_05-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_06-08.md": {
	id: "avgust/daily_06-08.md";
  slug: "avgust/daily_06-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_07-08.md": {
	id: "avgust/daily_07-08.md";
  slug: "avgust/daily_07-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_08-08.md": {
	id: "avgust/daily_08-08.md";
  slug: "avgust/daily_08-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_09-08.md": {
	id: "avgust/daily_09-08.md";
  slug: "avgust/daily_09-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_10-08.md": {
	id: "avgust/daily_10-08.md";
  slug: "avgust/daily_10-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_11-08.md": {
	id: "avgust/daily_11-08.md";
  slug: "avgust/daily_11-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_12-08.md": {
	id: "avgust/daily_12-08.md";
  slug: "avgust/daily_12-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_13-08.md": {
	id: "avgust/daily_13-08.md";
  slug: "avgust/daily_13-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_14-08.md": {
	id: "avgust/daily_14-08.md";
  slug: "avgust/daily_14-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_15-08.md": {
	id: "avgust/daily_15-08.md";
  slug: "avgust/daily_15-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_16-08.md": {
	id: "avgust/daily_16-08.md";
  slug: "avgust/daily_16-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_17-08.md": {
	id: "avgust/daily_17-08.md";
  slug: "avgust/daily_17-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_18-08.md": {
	id: "avgust/daily_18-08.md";
  slug: "avgust/daily_18-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_19-08.md": {
	id: "avgust/daily_19-08.md";
  slug: "avgust/daily_19-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_20-08.md": {
	id: "avgust/daily_20-08.md";
  slug: "avgust/daily_20-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_21-08.md": {
	id: "avgust/daily_21-08.md";
  slug: "avgust/daily_21-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_22-08.md": {
	id: "avgust/daily_22-08.md";
  slug: "avgust/daily_22-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_23-08.md": {
	id: "avgust/daily_23-08.md";
  slug: "avgust/daily_23-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_24-08.md": {
	id: "avgust/daily_24-08.md";
  slug: "avgust/daily_24-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_25-08.md": {
	id: "avgust/daily_25-08.md";
  slug: "avgust/daily_25-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_26-08.md": {
	id: "avgust/daily_26-08.md";
  slug: "avgust/daily_26-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_27-08.md": {
	id: "avgust/daily_27-08.md";
  slug: "avgust/daily_27-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_28-08.md": {
	id: "avgust/daily_28-08.md";
  slug: "avgust/daily_28-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_29-08.md": {
	id: "avgust/daily_29-08.md";
  slug: "avgust/daily_29-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_30-08.md": {
	id: "avgust/daily_30-08.md";
  slug: "avgust/daily_30-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"avgust/daily_31-08.md": {
	id: "avgust/daily_31-08.md";
  slug: "avgust/daily_31-08";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_01-12.md": {
	id: "dekabr/daily_01-12.md";
  slug: "dekabr/daily_01-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_02-12.md": {
	id: "dekabr/daily_02-12.md";
  slug: "dekabr/daily_02-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_03-12.md": {
	id: "dekabr/daily_03-12.md";
  slug: "dekabr/daily_03-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_04-12.md": {
	id: "dekabr/daily_04-12.md";
  slug: "dekabr/daily_04-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_05-12.md": {
	id: "dekabr/daily_05-12.md";
  slug: "dekabr/daily_05-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_06-12.md": {
	id: "dekabr/daily_06-12.md";
  slug: "dekabr/daily_06-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_07-12.md": {
	id: "dekabr/daily_07-12.md";
  slug: "dekabr/daily_07-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_08-12.md": {
	id: "dekabr/daily_08-12.md";
  slug: "dekabr/daily_08-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_09-12.md": {
	id: "dekabr/daily_09-12.md";
  slug: "dekabr/daily_09-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_10-12.md": {
	id: "dekabr/daily_10-12.md";
  slug: "dekabr/daily_10-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_11-12.md": {
	id: "dekabr/daily_11-12.md";
  slug: "dekabr/daily_11-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_12-12.md": {
	id: "dekabr/daily_12-12.md";
  slug: "dekabr/daily_12-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_13-12.md": {
	id: "dekabr/daily_13-12.md";
  slug: "dekabr/daily_13-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_14-12.md": {
	id: "dekabr/daily_14-12.md";
  slug: "dekabr/daily_14-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_15-12.md": {
	id: "dekabr/daily_15-12.md";
  slug: "dekabr/daily_15-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_16-12.md": {
	id: "dekabr/daily_16-12.md";
  slug: "dekabr/daily_16-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_17-12.md": {
	id: "dekabr/daily_17-12.md";
  slug: "dekabr/daily_17-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_18-12.md": {
	id: "dekabr/daily_18-12.md";
  slug: "dekabr/daily_18-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_19-12.md": {
	id: "dekabr/daily_19-12.md";
  slug: "dekabr/daily_19-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_20-12.md": {
	id: "dekabr/daily_20-12.md";
  slug: "dekabr/daily_20-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_21-12.md": {
	id: "dekabr/daily_21-12.md";
  slug: "dekabr/daily_21-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_22-12.md": {
	id: "dekabr/daily_22-12.md";
  slug: "dekabr/daily_22-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_23-12.md": {
	id: "dekabr/daily_23-12.md";
  slug: "dekabr/daily_23-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_24-12.md": {
	id: "dekabr/daily_24-12.md";
  slug: "dekabr/daily_24-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_25-12.md": {
	id: "dekabr/daily_25-12.md";
  slug: "dekabr/daily_25-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_26-12.md": {
	id: "dekabr/daily_26-12.md";
  slug: "dekabr/daily_26-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_27-12.md": {
	id: "dekabr/daily_27-12.md";
  slug: "dekabr/daily_27-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_28-12.md": {
	id: "dekabr/daily_28-12.md";
  slug: "dekabr/daily_28-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_29-12.md": {
	id: "dekabr/daily_29-12.md";
  slug: "dekabr/daily_29-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_30-12.md": {
	id: "dekabr/daily_30-12.md";
  slug: "dekabr/daily_30-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"dekabr/daily_31-12.md": {
	id: "dekabr/daily_31-12.md";
  slug: "dekabr/daily_31-12";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_01-02.md": {
	id: "fevral/daily_01-02.md";
  slug: "fevral/daily_01-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_02-02.md": {
	id: "fevral/daily_02-02.md";
  slug: "fevral/daily_02-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_03-02.md": {
	id: "fevral/daily_03-02.md";
  slug: "fevral/daily_03-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_04-02.md": {
	id: "fevral/daily_04-02.md";
  slug: "fevral/daily_04-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_05-02.md": {
	id: "fevral/daily_05-02.md";
  slug: "fevral/daily_05-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_06-02.md": {
	id: "fevral/daily_06-02.md";
  slug: "fevral/daily_06-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_07-02.md": {
	id: "fevral/daily_07-02.md";
  slug: "fevral/daily_07-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_08-02.md": {
	id: "fevral/daily_08-02.md";
  slug: "fevral/daily_08-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_09-02.md": {
	id: "fevral/daily_09-02.md";
  slug: "fevral/daily_09-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_10-02.md": {
	id: "fevral/daily_10-02.md";
  slug: "fevral/daily_10-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_11-02.md": {
	id: "fevral/daily_11-02.md";
  slug: "fevral/daily_11-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_12-02.md": {
	id: "fevral/daily_12-02.md";
  slug: "fevral/daily_12-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_13-02.md": {
	id: "fevral/daily_13-02.md";
  slug: "fevral/daily_13-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_14-02.md": {
	id: "fevral/daily_14-02.md";
  slug: "fevral/daily_14-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_15-02.md": {
	id: "fevral/daily_15-02.md";
  slug: "fevral/daily_15-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_16-02.md": {
	id: "fevral/daily_16-02.md";
  slug: "fevral/daily_16-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_17-02.md": {
	id: "fevral/daily_17-02.md";
  slug: "fevral/daily_17-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_18-02.md": {
	id: "fevral/daily_18-02.md";
  slug: "fevral/daily_18-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_19-02.md": {
	id: "fevral/daily_19-02.md";
  slug: "fevral/daily_19-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_20-02.md": {
	id: "fevral/daily_20-02.md";
  slug: "fevral/daily_20-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_21-02.md": {
	id: "fevral/daily_21-02.md";
  slug: "fevral/daily_21-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_22-02.md": {
	id: "fevral/daily_22-02.md";
  slug: "fevral/daily_22-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_23-02.md": {
	id: "fevral/daily_23-02.md";
  slug: "fevral/daily_23-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_24-02.md": {
	id: "fevral/daily_24-02.md";
  slug: "fevral/daily_24-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_25-02.md": {
	id: "fevral/daily_25-02.md";
  slug: "fevral/daily_25-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_26-02.md": {
	id: "fevral/daily_26-02.md";
  slug: "fevral/daily_26-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_27-02.md": {
	id: "fevral/daily_27-02.md";
  slug: "fevral/daily_27-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_28-02.md": {
	id: "fevral/daily_28-02.md";
  slug: "fevral/daily_28-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"fevral/daily_29-02.md": {
	id: "fevral/daily_29-02.md";
  slug: "fevral/daily_29-02";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_00-07.md": {
	id: "iyul/daily_00-07.md";
  slug: "iyul/daily_00-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_01-07.md": {
	id: "iyul/daily_01-07.md";
  slug: "iyul/daily_01-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_02-07.md": {
	id: "iyul/daily_02-07.md";
  slug: "iyul/daily_02-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_03-07.md": {
	id: "iyul/daily_03-07.md";
  slug: "iyul/daily_03-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_04-07.md": {
	id: "iyul/daily_04-07.md";
  slug: "iyul/daily_04-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_05-07.md": {
	id: "iyul/daily_05-07.md";
  slug: "iyul/daily_05-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_06-07.md": {
	id: "iyul/daily_06-07.md";
  slug: "iyul/daily_06-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_07-07.md": {
	id: "iyul/daily_07-07.md";
  slug: "iyul/daily_07-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_08-07.md": {
	id: "iyul/daily_08-07.md";
  slug: "iyul/daily_08-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_09-07.md": {
	id: "iyul/daily_09-07.md";
  slug: "iyul/daily_09-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_10-07.md": {
	id: "iyul/daily_10-07.md";
  slug: "iyul/daily_10-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_11-07.md": {
	id: "iyul/daily_11-07.md";
  slug: "iyul/daily_11-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_12-07.md": {
	id: "iyul/daily_12-07.md";
  slug: "iyul/daily_12-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_13-07.md": {
	id: "iyul/daily_13-07.md";
  slug: "iyul/daily_13-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_14-07.md": {
	id: "iyul/daily_14-07.md";
  slug: "iyul/daily_14-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_15-07.md": {
	id: "iyul/daily_15-07.md";
  slug: "iyul/daily_15-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_16-07.md": {
	id: "iyul/daily_16-07.md";
  slug: "iyul/daily_16-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_17-07.md": {
	id: "iyul/daily_17-07.md";
  slug: "iyul/daily_17-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_18-07.md": {
	id: "iyul/daily_18-07.md";
  slug: "iyul/daily_18-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_19-07.md": {
	id: "iyul/daily_19-07.md";
  slug: "iyul/daily_19-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_20-07.md": {
	id: "iyul/daily_20-07.md";
  slug: "iyul/daily_20-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_21-07.md": {
	id: "iyul/daily_21-07.md";
  slug: "iyul/daily_21-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_22-07.md": {
	id: "iyul/daily_22-07.md";
  slug: "iyul/daily_22-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_23-07.md": {
	id: "iyul/daily_23-07.md";
  slug: "iyul/daily_23-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_24-07.md": {
	id: "iyul/daily_24-07.md";
  slug: "iyul/daily_24-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_25-07.md": {
	id: "iyul/daily_25-07.md";
  slug: "iyul/daily_25-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_26-07.md": {
	id: "iyul/daily_26-07.md";
  slug: "iyul/daily_26-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_27-07.md": {
	id: "iyul/daily_27-07.md";
  slug: "iyul/daily_27-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_28-07.md": {
	id: "iyul/daily_28-07.md";
  slug: "iyul/daily_28-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_29-07.md": {
	id: "iyul/daily_29-07.md";
  slug: "iyul/daily_29-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_30-07.md": {
	id: "iyul/daily_30-07.md";
  slug: "iyul/daily_30-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyul/daily_31-07.md": {
	id: "iyul/daily_31-07.md";
  slug: "iyul/daily_31-07";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_01-06.md": {
	id: "iyun/daily_01-06.md";
  slug: "iyun/daily_01-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_02-06.md": {
	id: "iyun/daily_02-06.md";
  slug: "iyun/daily_02-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_03-06.md": {
	id: "iyun/daily_03-06.md";
  slug: "iyun/daily_03-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_04-06.md": {
	id: "iyun/daily_04-06.md";
  slug: "iyun/daily_04-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_05-06.md": {
	id: "iyun/daily_05-06.md";
  slug: "iyun/daily_05-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_06-06.md": {
	id: "iyun/daily_06-06.md";
  slug: "iyun/daily_06-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_07-06.md": {
	id: "iyun/daily_07-06.md";
  slug: "iyun/daily_07-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_08-06.md": {
	id: "iyun/daily_08-06.md";
  slug: "iyun/daily_08-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_09-06.md": {
	id: "iyun/daily_09-06.md";
  slug: "iyun/daily_09-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_10-06.md": {
	id: "iyun/daily_10-06.md";
  slug: "iyun/daily_10-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_11-06.md": {
	id: "iyun/daily_11-06.md";
  slug: "iyun/daily_11-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_12-06.md": {
	id: "iyun/daily_12-06.md";
  slug: "iyun/daily_12-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_13-06.md": {
	id: "iyun/daily_13-06.md";
  slug: "iyun/daily_13-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_14-06.md": {
	id: "iyun/daily_14-06.md";
  slug: "iyun/daily_14-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_15-06.md": {
	id: "iyun/daily_15-06.md";
  slug: "iyun/daily_15-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_16-06.md": {
	id: "iyun/daily_16-06.md";
  slug: "iyun/daily_16-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_17-06.md": {
	id: "iyun/daily_17-06.md";
  slug: "iyun/daily_17-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_18-06.md": {
	id: "iyun/daily_18-06.md";
  slug: "iyun/daily_18-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_19-06.md": {
	id: "iyun/daily_19-06.md";
  slug: "iyun/daily_19-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_20-06.md": {
	id: "iyun/daily_20-06.md";
  slug: "iyun/daily_20-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_21-06.md": {
	id: "iyun/daily_21-06.md";
  slug: "iyun/daily_21-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_22-06.md": {
	id: "iyun/daily_22-06.md";
  slug: "iyun/daily_22-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_23-06.md": {
	id: "iyun/daily_23-06.md";
  slug: "iyun/daily_23-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_24-06.md": {
	id: "iyun/daily_24-06.md";
  slug: "iyun/daily_24-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_25-06.md": {
	id: "iyun/daily_25-06.md";
  slug: "iyun/daily_25-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_26-06.md": {
	id: "iyun/daily_26-06.md";
  slug: "iyun/daily_26-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_27-06.md": {
	id: "iyun/daily_27-06.md";
  slug: "iyun/daily_27-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_28-06.md": {
	id: "iyun/daily_28-06.md";
  slug: "iyun/daily_28-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_29-06.md": {
	id: "iyun/daily_29-06.md";
  slug: "iyun/daily_29-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"iyun/daily_30-06.md": {
	id: "iyun/daily_30-06.md";
  slug: "iyun/daily_30-06";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_01-05.md": {
	id: "maj/daily_01-05.md";
  slug: "maj/daily_01-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_02-05.md": {
	id: "maj/daily_02-05.md";
  slug: "maj/daily_02-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_03-05.md": {
	id: "maj/daily_03-05.md";
  slug: "maj/daily_03-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_04-05.md": {
	id: "maj/daily_04-05.md";
  slug: "maj/daily_04-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_05-05.md": {
	id: "maj/daily_05-05.md";
  slug: "maj/daily_05-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_06-05.md": {
	id: "maj/daily_06-05.md";
  slug: "maj/daily_06-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_07-05.md": {
	id: "maj/daily_07-05.md";
  slug: "maj/daily_07-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_08-05.md": {
	id: "maj/daily_08-05.md";
  slug: "maj/daily_08-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_09-05.md": {
	id: "maj/daily_09-05.md";
  slug: "maj/daily_09-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_10-05.md": {
	id: "maj/daily_10-05.md";
  slug: "maj/daily_10-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_11-05.md": {
	id: "maj/daily_11-05.md";
  slug: "maj/daily_11-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_12-05.md": {
	id: "maj/daily_12-05.md";
  slug: "maj/daily_12-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_13-05.md": {
	id: "maj/daily_13-05.md";
  slug: "maj/daily_13-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_14-05.md": {
	id: "maj/daily_14-05.md";
  slug: "maj/daily_14-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_15-05.md": {
	id: "maj/daily_15-05.md";
  slug: "maj/daily_15-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_16-05.md": {
	id: "maj/daily_16-05.md";
  slug: "maj/daily_16-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_17-05.md": {
	id: "maj/daily_17-05.md";
  slug: "maj/daily_17-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_18-05.md": {
	id: "maj/daily_18-05.md";
  slug: "maj/daily_18-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_19-05.md": {
	id: "maj/daily_19-05.md";
  slug: "maj/daily_19-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_20-05.md": {
	id: "maj/daily_20-05.md";
  slug: "maj/daily_20-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_21-05.md": {
	id: "maj/daily_21-05.md";
  slug: "maj/daily_21-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_22-05.md": {
	id: "maj/daily_22-05.md";
  slug: "maj/daily_22-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_23-05.md": {
	id: "maj/daily_23-05.md";
  slug: "maj/daily_23-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_24-05.md": {
	id: "maj/daily_24-05.md";
  slug: "maj/daily_24-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_25-05.md": {
	id: "maj/daily_25-05.md";
  slug: "maj/daily_25-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_26-05.md": {
	id: "maj/daily_26-05.md";
  slug: "maj/daily_26-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_27-05.md": {
	id: "maj/daily_27-05.md";
  slug: "maj/daily_27-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_28-05.md": {
	id: "maj/daily_28-05.md";
  slug: "maj/daily_28-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_29-05.md": {
	id: "maj/daily_29-05.md";
  slug: "maj/daily_29-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_30-05.md": {
	id: "maj/daily_30-05.md";
  slug: "maj/daily_30-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"maj/daily_31-05.md": {
	id: "maj/daily_31-05.md";
  slug: "maj/daily_31-05";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_01-03.md": {
	id: "mart/daily_01-03.md";
  slug: "mart/daily_01-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_02-03.md": {
	id: "mart/daily_02-03.md";
  slug: "mart/daily_02-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_03-03.md": {
	id: "mart/daily_03-03.md";
  slug: "mart/daily_03-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_04-03.md": {
	id: "mart/daily_04-03.md";
  slug: "mart/daily_04-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_05-03.md": {
	id: "mart/daily_05-03.md";
  slug: "mart/daily_05-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_06-03.md": {
	id: "mart/daily_06-03.md";
  slug: "mart/daily_06-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_07-03.md": {
	id: "mart/daily_07-03.md";
  slug: "mart/daily_07-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_08-03.md": {
	id: "mart/daily_08-03.md";
  slug: "mart/daily_08-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_09-03.md": {
	id: "mart/daily_09-03.md";
  slug: "mart/daily_09-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_10-03.md": {
	id: "mart/daily_10-03.md";
  slug: "mart/daily_10-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_11-03.md": {
	id: "mart/daily_11-03.md";
  slug: "mart/daily_11-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_12-03.md": {
	id: "mart/daily_12-03.md";
  slug: "mart/daily_12-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_13-03.md": {
	id: "mart/daily_13-03.md";
  slug: "mart/daily_13-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_14-03.md": {
	id: "mart/daily_14-03.md";
  slug: "mart/daily_14-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_15-03.md": {
	id: "mart/daily_15-03.md";
  slug: "mart/daily_15-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_16-03.md": {
	id: "mart/daily_16-03.md";
  slug: "mart/daily_16-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_17-03.md": {
	id: "mart/daily_17-03.md";
  slug: "mart/daily_17-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_18-03.md": {
	id: "mart/daily_18-03.md";
  slug: "mart/daily_18-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_19-03.md": {
	id: "mart/daily_19-03.md";
  slug: "mart/daily_19-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_20-03.md": {
	id: "mart/daily_20-03.md";
  slug: "mart/daily_20-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_21-03.md": {
	id: "mart/daily_21-03.md";
  slug: "mart/daily_21-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_22-03.md": {
	id: "mart/daily_22-03.md";
  slug: "mart/daily_22-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_23-03.md": {
	id: "mart/daily_23-03.md";
  slug: "mart/daily_23-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_24-03.md": {
	id: "mart/daily_24-03.md";
  slug: "mart/daily_24-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_25-03.md": {
	id: "mart/daily_25-03.md";
  slug: "mart/daily_25-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_26-03.md": {
	id: "mart/daily_26-03.md";
  slug: "mart/daily_26-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_27-03.md": {
	id: "mart/daily_27-03.md";
  slug: "mart/daily_27-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_28-03.md": {
	id: "mart/daily_28-03.md";
  slug: "mart/daily_28-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_29-03.md": {
	id: "mart/daily_29-03.md";
  slug: "mart/daily_29-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_30-03.md": {
	id: "mart/daily_30-03.md";
  slug: "mart/daily_30-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"mart/daily_31-03.md": {
	id: "mart/daily_31-03.md";
  slug: "mart/daily_31-03";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_01-11.md": {
	id: "noyabr/daily_01-11.md";
  slug: "noyabr/daily_01-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_02-11.md": {
	id: "noyabr/daily_02-11.md";
  slug: "noyabr/daily_02-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_03-11.md": {
	id: "noyabr/daily_03-11.md";
  slug: "noyabr/daily_03-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_04-11.md": {
	id: "noyabr/daily_04-11.md";
  slug: "noyabr/daily_04-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_05-11.md": {
	id: "noyabr/daily_05-11.md";
  slug: "noyabr/daily_05-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_06-11.md": {
	id: "noyabr/daily_06-11.md";
  slug: "noyabr/daily_06-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_07-11.md": {
	id: "noyabr/daily_07-11.md";
  slug: "noyabr/daily_07-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_08-11.md": {
	id: "noyabr/daily_08-11.md";
  slug: "noyabr/daily_08-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_09-11.md": {
	id: "noyabr/daily_09-11.md";
  slug: "noyabr/daily_09-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_10-11.md": {
	id: "noyabr/daily_10-11.md";
  slug: "noyabr/daily_10-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_11-11.md": {
	id: "noyabr/daily_11-11.md";
  slug: "noyabr/daily_11-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_12-11.md": {
	id: "noyabr/daily_12-11.md";
  slug: "noyabr/daily_12-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_13-11.md": {
	id: "noyabr/daily_13-11.md";
  slug: "noyabr/daily_13-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_14-11.md": {
	id: "noyabr/daily_14-11.md";
  slug: "noyabr/daily_14-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_15-11.md": {
	id: "noyabr/daily_15-11.md";
  slug: "noyabr/daily_15-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_16-11.md": {
	id: "noyabr/daily_16-11.md";
  slug: "noyabr/daily_16-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_17-11.md": {
	id: "noyabr/daily_17-11.md";
  slug: "noyabr/daily_17-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_18-11.md": {
	id: "noyabr/daily_18-11.md";
  slug: "noyabr/daily_18-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_19-11.md": {
	id: "noyabr/daily_19-11.md";
  slug: "noyabr/daily_19-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_20-11.md": {
	id: "noyabr/daily_20-11.md";
  slug: "noyabr/daily_20-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_21-11.md": {
	id: "noyabr/daily_21-11.md";
  slug: "noyabr/daily_21-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_22-11.md": {
	id: "noyabr/daily_22-11.md";
  slug: "noyabr/daily_22-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_23-11.md": {
	id: "noyabr/daily_23-11.md";
  slug: "noyabr/daily_23-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_24-11.md": {
	id: "noyabr/daily_24-11.md";
  slug: "noyabr/daily_24-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_25-11.md": {
	id: "noyabr/daily_25-11.md";
  slug: "noyabr/daily_25-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_26-11.md": {
	id: "noyabr/daily_26-11.md";
  slug: "noyabr/daily_26-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_27-11.md": {
	id: "noyabr/daily_27-11.md";
  slug: "noyabr/daily_27-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_28-11.md": {
	id: "noyabr/daily_28-11.md";
  slug: "noyabr/daily_28-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_29-11.md": {
	id: "noyabr/daily_29-11.md";
  slug: "noyabr/daily_29-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"noyabr/daily_30-11.md": {
	id: "noyabr/daily_30-11.md";
  slug: "noyabr/daily_30-11";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_01-10.md": {
	id: "oktyabr/daily_01-10.md";
  slug: "oktyabr/daily_01-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_02-10.md": {
	id: "oktyabr/daily_02-10.md";
  slug: "oktyabr/daily_02-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_03-10.md": {
	id: "oktyabr/daily_03-10.md";
  slug: "oktyabr/daily_03-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_04-10.md": {
	id: "oktyabr/daily_04-10.md";
  slug: "oktyabr/daily_04-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_05-10.md": {
	id: "oktyabr/daily_05-10.md";
  slug: "oktyabr/daily_05-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_06-10.md": {
	id: "oktyabr/daily_06-10.md";
  slug: "oktyabr/daily_06-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_07-10.md": {
	id: "oktyabr/daily_07-10.md";
  slug: "oktyabr/daily_07-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_08-10.md": {
	id: "oktyabr/daily_08-10.md";
  slug: "oktyabr/daily_08-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_09-10.md": {
	id: "oktyabr/daily_09-10.md";
  slug: "oktyabr/daily_09-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_10-10.md": {
	id: "oktyabr/daily_10-10.md";
  slug: "oktyabr/daily_10-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_11-10.md": {
	id: "oktyabr/daily_11-10.md";
  slug: "oktyabr/daily_11-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_12-10.md": {
	id: "oktyabr/daily_12-10.md";
  slug: "oktyabr/daily_12-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_13-10.md": {
	id: "oktyabr/daily_13-10.md";
  slug: "oktyabr/daily_13-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_14-10.md": {
	id: "oktyabr/daily_14-10.md";
  slug: "oktyabr/daily_14-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_15-10.md": {
	id: "oktyabr/daily_15-10.md";
  slug: "oktyabr/daily_15-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_16-10.md": {
	id: "oktyabr/daily_16-10.md";
  slug: "oktyabr/daily_16-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_17-10.md": {
	id: "oktyabr/daily_17-10.md";
  slug: "oktyabr/daily_17-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_18-10.md": {
	id: "oktyabr/daily_18-10.md";
  slug: "oktyabr/daily_18-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_19-10.md": {
	id: "oktyabr/daily_19-10.md";
  slug: "oktyabr/daily_19-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_20-10.md": {
	id: "oktyabr/daily_20-10.md";
  slug: "oktyabr/daily_20-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_21-10.md": {
	id: "oktyabr/daily_21-10.md";
  slug: "oktyabr/daily_21-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_22-10.md": {
	id: "oktyabr/daily_22-10.md";
  slug: "oktyabr/daily_22-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_23-10.md": {
	id: "oktyabr/daily_23-10.md";
  slug: "oktyabr/daily_23-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_24-10.md": {
	id: "oktyabr/daily_24-10.md";
  slug: "oktyabr/daily_24-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_25-10.md": {
	id: "oktyabr/daily_25-10.md";
  slug: "oktyabr/daily_25-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_26-10.md": {
	id: "oktyabr/daily_26-10.md";
  slug: "oktyabr/daily_26-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_27-10.md": {
	id: "oktyabr/daily_27-10.md";
  slug: "oktyabr/daily_27-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_28-10.md": {
	id: "oktyabr/daily_28-10.md";
  slug: "oktyabr/daily_28-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_29-10.md": {
	id: "oktyabr/daily_29-10.md";
  slug: "oktyabr/daily_29-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_30-10.md": {
	id: "oktyabr/daily_30-10.md";
  slug: "oktyabr/daily_30-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"oktyabr/daily_31-10.md": {
	id: "oktyabr/daily_31-10.md";
  slug: "oktyabr/daily_31-10";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_01-09.md": {
	id: "sentyabr/daily_01-09.md";
  slug: "sentyabr/daily_01-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_02-09.md": {
	id: "sentyabr/daily_02-09.md";
  slug: "sentyabr/daily_02-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_03-09.md": {
	id: "sentyabr/daily_03-09.md";
  slug: "sentyabr/daily_03-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_04-09.md": {
	id: "sentyabr/daily_04-09.md";
  slug: "sentyabr/daily_04-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_05-09.md": {
	id: "sentyabr/daily_05-09.md";
  slug: "sentyabr/daily_05-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_06-09.md": {
	id: "sentyabr/daily_06-09.md";
  slug: "sentyabr/daily_06-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_07-09.md": {
	id: "sentyabr/daily_07-09.md";
  slug: "sentyabr/daily_07-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_08-09.md": {
	id: "sentyabr/daily_08-09.md";
  slug: "sentyabr/daily_08-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_09-09.md": {
	id: "sentyabr/daily_09-09.md";
  slug: "sentyabr/daily_09-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_10-09.md": {
	id: "sentyabr/daily_10-09.md";
  slug: "sentyabr/daily_10-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_11-09.md": {
	id: "sentyabr/daily_11-09.md";
  slug: "sentyabr/daily_11-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_12-09.md": {
	id: "sentyabr/daily_12-09.md";
  slug: "sentyabr/daily_12-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_13-09.md": {
	id: "sentyabr/daily_13-09.md";
  slug: "sentyabr/daily_13-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_14-09.md": {
	id: "sentyabr/daily_14-09.md";
  slug: "sentyabr/daily_14-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_15-09.md": {
	id: "sentyabr/daily_15-09.md";
  slug: "sentyabr/daily_15-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_16-09.md": {
	id: "sentyabr/daily_16-09.md";
  slug: "sentyabr/daily_16-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_17-09.md": {
	id: "sentyabr/daily_17-09.md";
  slug: "sentyabr/daily_17-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_18-09.md": {
	id: "sentyabr/daily_18-09.md";
  slug: "sentyabr/daily_18-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_19-09.md": {
	id: "sentyabr/daily_19-09.md";
  slug: "sentyabr/daily_19-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_20-09.md": {
	id: "sentyabr/daily_20-09.md";
  slug: "sentyabr/daily_20-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_21-09.md": {
	id: "sentyabr/daily_21-09.md";
  slug: "sentyabr/daily_21-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_22-09.md": {
	id: "sentyabr/daily_22-09.md";
  slug: "sentyabr/daily_22-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_23-09.md": {
	id: "sentyabr/daily_23-09.md";
  slug: "sentyabr/daily_23-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_24-09.md": {
	id: "sentyabr/daily_24-09.md";
  slug: "sentyabr/daily_24-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_25-09.md": {
	id: "sentyabr/daily_25-09.md";
  slug: "sentyabr/daily_25-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_26-09.md": {
	id: "sentyabr/daily_26-09.md";
  slug: "sentyabr/daily_26-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_27-09.md": {
	id: "sentyabr/daily_27-09.md";
  slug: "sentyabr/daily_27-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_28-09.md": {
	id: "sentyabr/daily_28-09.md";
  slug: "sentyabr/daily_28-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_29-09.md": {
	id: "sentyabr/daily_29-09.md";
  slug: "sentyabr/daily_29-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"sentyabr/daily_30-09.md": {
	id: "sentyabr/daily_30-09.md";
  slug: "sentyabr/daily_30-09";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_01-01.md": {
	id: "yanvar/daily_01-01.md";
  slug: "yanvar/daily_01-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_02-01.md": {
	id: "yanvar/daily_02-01.md";
  slug: "yanvar/daily_02-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_03-01.md": {
	id: "yanvar/daily_03-01.md";
  slug: "yanvar/daily_03-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_04-01.md": {
	id: "yanvar/daily_04-01.md";
  slug: "yanvar/daily_04-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_05-01.md": {
	id: "yanvar/daily_05-01.md";
  slug: "yanvar/daily_05-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_06-01.md": {
	id: "yanvar/daily_06-01.md";
  slug: "yanvar/daily_06-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_07-01.md": {
	id: "yanvar/daily_07-01.md";
  slug: "yanvar/daily_07-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_08-01.md": {
	id: "yanvar/daily_08-01.md";
  slug: "yanvar/daily_08-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_09-01.md": {
	id: "yanvar/daily_09-01.md";
  slug: "yanvar/daily_09-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_10-01.md": {
	id: "yanvar/daily_10-01.md";
  slug: "yanvar/daily_10-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_11-01.md": {
	id: "yanvar/daily_11-01.md";
  slug: "yanvar/daily_11-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_12-01.md": {
	id: "yanvar/daily_12-01.md";
  slug: "yanvar/daily_12-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_13-01.md": {
	id: "yanvar/daily_13-01.md";
  slug: "yanvar/daily_13-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_14-01.md": {
	id: "yanvar/daily_14-01.md";
  slug: "yanvar/daily_14-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_15-01.md": {
	id: "yanvar/daily_15-01.md";
  slug: "yanvar/daily_15-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_16-01.md": {
	id: "yanvar/daily_16-01.md";
  slug: "yanvar/daily_16-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_17-01.md": {
	id: "yanvar/daily_17-01.md";
  slug: "yanvar/daily_17-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_18-01.md": {
	id: "yanvar/daily_18-01.md";
  slug: "yanvar/daily_18-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_19-01.md": {
	id: "yanvar/daily_19-01.md";
  slug: "yanvar/daily_19-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_20-01.md": {
	id: "yanvar/daily_20-01.md";
  slug: "yanvar/daily_20-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_21-01.md": {
	id: "yanvar/daily_21-01.md";
  slug: "yanvar/daily_21-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_22-01.md": {
	id: "yanvar/daily_22-01.md";
  slug: "yanvar/daily_22-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_23-01.md": {
	id: "yanvar/daily_23-01.md";
  slug: "yanvar/daily_23-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_24-01.md": {
	id: "yanvar/daily_24-01.md";
  slug: "yanvar/daily_24-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_25-01.md": {
	id: "yanvar/daily_25-01.md";
  slug: "yanvar/daily_25-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_26-01.md": {
	id: "yanvar/daily_26-01.md";
  slug: "yanvar/daily_26-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_27-01.md": {
	id: "yanvar/daily_27-01.md";
  slug: "yanvar/daily_27-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_28-01.md": {
	id: "yanvar/daily_28-01.md";
  slug: "yanvar/daily_28-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_29-01.md": {
	id: "yanvar/daily_29-01.md";
  slug: "yanvar/daily_29-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_30-01.md": {
	id: "yanvar/daily_30-01.md";
  slug: "yanvar/daily_30-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
"yanvar/daily_31-01.md": {
	id: "yanvar/daily_31-01.md";
  slug: "yanvar/daily_31-01";
  body: string;
  collection: "alanonmm";
  data: InferEntrySchema<"alanonmm">
} & { render(): Render[".md"] };
};
"an": {
"april/daily_01-04.md": {
	id: "april/daily_01-04.md";
  slug: "april/daily_01-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_02-04.md": {
	id: "april/daily_02-04.md";
  slug: "april/daily_02-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_03-04.md": {
	id: "april/daily_03-04.md";
  slug: "april/daily_03-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_04-04.md": {
	id: "april/daily_04-04.md";
  slug: "april/daily_04-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_05-04.md": {
	id: "april/daily_05-04.md";
  slug: "april/daily_05-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_06-04.md": {
	id: "april/daily_06-04.md";
  slug: "april/daily_06-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_07-04.md": {
	id: "april/daily_07-04.md";
  slug: "april/daily_07-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_08-04.md": {
	id: "april/daily_08-04.md";
  slug: "april/daily_08-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_09-04.md": {
	id: "april/daily_09-04.md";
  slug: "april/daily_09-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_10-04.md": {
	id: "april/daily_10-04.md";
  slug: "april/daily_10-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_11-04.md": {
	id: "april/daily_11-04.md";
  slug: "april/daily_11-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_12-04.md": {
	id: "april/daily_12-04.md";
  slug: "april/daily_12-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_13-04.md": {
	id: "april/daily_13-04.md";
  slug: "april/daily_13-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_14-04.md": {
	id: "april/daily_14-04.md";
  slug: "april/daily_14-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_15-04.md": {
	id: "april/daily_15-04.md";
  slug: "april/daily_15-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_16-04.md": {
	id: "april/daily_16-04.md";
  slug: "april/daily_16-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_17-04.md": {
	id: "april/daily_17-04.md";
  slug: "april/daily_17-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_18-04.md": {
	id: "april/daily_18-04.md";
  slug: "april/daily_18-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_19-04.md": {
	id: "april/daily_19-04.md";
  slug: "april/daily_19-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_20-04.md": {
	id: "april/daily_20-04.md";
  slug: "april/daily_20-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_21-04.md": {
	id: "april/daily_21-04.md";
  slug: "april/daily_21-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_22-04.md": {
	id: "april/daily_22-04.md";
  slug: "april/daily_22-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_23-04.md": {
	id: "april/daily_23-04.md";
  slug: "april/daily_23-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_24-04.md": {
	id: "april/daily_24-04.md";
  slug: "april/daily_24-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_25-04.md": {
	id: "april/daily_25-04.md";
  slug: "april/daily_25-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_26-04.md": {
	id: "april/daily_26-04.md";
  slug: "april/daily_26-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_27-04.md": {
	id: "april/daily_27-04.md";
  slug: "april/daily_27-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_28-04.md": {
	id: "april/daily_28-04.md";
  slug: "april/daily_28-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_29-04.md": {
	id: "april/daily_29-04.md";
  slug: "april/daily_29-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"april/daily_30-04.md": {
	id: "april/daily_30-04.md";
  slug: "april/daily_30-04";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_01-08.md": {
	id: "avgust/daily_01-08.md";
  slug: "avgust/daily_01-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_02-08.md": {
	id: "avgust/daily_02-08.md";
  slug: "avgust/daily_02-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_03-08.md": {
	id: "avgust/daily_03-08.md";
  slug: "avgust/daily_03-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_04-08.md": {
	id: "avgust/daily_04-08.md";
  slug: "avgust/daily_04-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_05-08.md": {
	id: "avgust/daily_05-08.md";
  slug: "avgust/daily_05-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_06-08.md": {
	id: "avgust/daily_06-08.md";
  slug: "avgust/daily_06-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_07-08.md": {
	id: "avgust/daily_07-08.md";
  slug: "avgust/daily_07-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_08-08.md": {
	id: "avgust/daily_08-08.md";
  slug: "avgust/daily_08-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_09-08.md": {
	id: "avgust/daily_09-08.md";
  slug: "avgust/daily_09-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_10-08.md": {
	id: "avgust/daily_10-08.md";
  slug: "avgust/daily_10-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_11-08.md": {
	id: "avgust/daily_11-08.md";
  slug: "avgust/daily_11-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_12-08.md": {
	id: "avgust/daily_12-08.md";
  slug: "avgust/daily_12-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_13-08.md": {
	id: "avgust/daily_13-08.md";
  slug: "avgust/daily_13-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_14-08.md": {
	id: "avgust/daily_14-08.md";
  slug: "avgust/daily_14-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_15-08.md": {
	id: "avgust/daily_15-08.md";
  slug: "avgust/daily_15-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_16-08.md": {
	id: "avgust/daily_16-08.md";
  slug: "avgust/daily_16-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_17-08.md": {
	id: "avgust/daily_17-08.md";
  slug: "avgust/daily_17-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_18-08.md": {
	id: "avgust/daily_18-08.md";
  slug: "avgust/daily_18-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_19-08.md": {
	id: "avgust/daily_19-08.md";
  slug: "avgust/daily_19-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_20-08.md": {
	id: "avgust/daily_20-08.md";
  slug: "avgust/daily_20-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_21-08.md": {
	id: "avgust/daily_21-08.md";
  slug: "avgust/daily_21-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_22-08.md": {
	id: "avgust/daily_22-08.md";
  slug: "avgust/daily_22-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_23-08.md": {
	id: "avgust/daily_23-08.md";
  slug: "avgust/daily_23-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_24-08.md": {
	id: "avgust/daily_24-08.md";
  slug: "avgust/daily_24-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_25-08.md": {
	id: "avgust/daily_25-08.md";
  slug: "avgust/daily_25-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_26-08.md": {
	id: "avgust/daily_26-08.md";
  slug: "avgust/daily_26-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_27-08.md": {
	id: "avgust/daily_27-08.md";
  slug: "avgust/daily_27-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_28-08.md": {
	id: "avgust/daily_28-08.md";
  slug: "avgust/daily_28-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_29-08.md": {
	id: "avgust/daily_29-08.md";
  slug: "avgust/daily_29-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_30-08.md": {
	id: "avgust/daily_30-08.md";
  slug: "avgust/daily_30-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"avgust/daily_31-08.md": {
	id: "avgust/daily_31-08.md";
  slug: "avgust/daily_31-08";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_01-12.md": {
	id: "dekabr/daily_01-12.md";
  slug: "dekabr/daily_01-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_02-12.md": {
	id: "dekabr/daily_02-12.md";
  slug: "dekabr/daily_02-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_03-12.md": {
	id: "dekabr/daily_03-12.md";
  slug: "dekabr/daily_03-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_04-12.md": {
	id: "dekabr/daily_04-12.md";
  slug: "dekabr/daily_04-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_05-12.md": {
	id: "dekabr/daily_05-12.md";
  slug: "dekabr/daily_05-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_06-12.md": {
	id: "dekabr/daily_06-12.md";
  slug: "dekabr/daily_06-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_07-12.md": {
	id: "dekabr/daily_07-12.md";
  slug: "dekabr/daily_07-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_08-12.md": {
	id: "dekabr/daily_08-12.md";
  slug: "dekabr/daily_08-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_09-12.md": {
	id: "dekabr/daily_09-12.md";
  slug: "dekabr/daily_09-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_10-12.md": {
	id: "dekabr/daily_10-12.md";
  slug: "dekabr/daily_10-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_11-12.md": {
	id: "dekabr/daily_11-12.md";
  slug: "dekabr/daily_11-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_12-12.md": {
	id: "dekabr/daily_12-12.md";
  slug: "dekabr/daily_12-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_13-12.md": {
	id: "dekabr/daily_13-12.md";
  slug: "dekabr/daily_13-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_14-12.md": {
	id: "dekabr/daily_14-12.md";
  slug: "dekabr/daily_14-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_15-12.md": {
	id: "dekabr/daily_15-12.md";
  slug: "dekabr/daily_15-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_16-12.md": {
	id: "dekabr/daily_16-12.md";
  slug: "dekabr/daily_16-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_17-12.md": {
	id: "dekabr/daily_17-12.md";
  slug: "dekabr/daily_17-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_18-12.md": {
	id: "dekabr/daily_18-12.md";
  slug: "dekabr/daily_18-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_19-12.md": {
	id: "dekabr/daily_19-12.md";
  slug: "dekabr/daily_19-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_20-12.md": {
	id: "dekabr/daily_20-12.md";
  slug: "dekabr/daily_20-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_21-12.md": {
	id: "dekabr/daily_21-12.md";
  slug: "dekabr/daily_21-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_22-12.md": {
	id: "dekabr/daily_22-12.md";
  slug: "dekabr/daily_22-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_23-12.md": {
	id: "dekabr/daily_23-12.md";
  slug: "dekabr/daily_23-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_24-12.md": {
	id: "dekabr/daily_24-12.md";
  slug: "dekabr/daily_24-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_25-12.md": {
	id: "dekabr/daily_25-12.md";
  slug: "dekabr/daily_25-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_26-12.md": {
	id: "dekabr/daily_26-12.md";
  slug: "dekabr/daily_26-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_27-12.md": {
	id: "dekabr/daily_27-12.md";
  slug: "dekabr/daily_27-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_28-12.md": {
	id: "dekabr/daily_28-12.md";
  slug: "dekabr/daily_28-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_29-12.md": {
	id: "dekabr/daily_29-12.md";
  slug: "dekabr/daily_29-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_30-12.md": {
	id: "dekabr/daily_30-12.md";
  slug: "dekabr/daily_30-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"dekabr/daily_31-12.md": {
	id: "dekabr/daily_31-12.md";
  slug: "dekabr/daily_31-12";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_01-02.md": {
	id: "fevral/daily_01-02.md";
  slug: "fevral/daily_01-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_02-02.md": {
	id: "fevral/daily_02-02.md";
  slug: "fevral/daily_02-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_03-02.md": {
	id: "fevral/daily_03-02.md";
  slug: "fevral/daily_03-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_04-02.md": {
	id: "fevral/daily_04-02.md";
  slug: "fevral/daily_04-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_05-02.md": {
	id: "fevral/daily_05-02.md";
  slug: "fevral/daily_05-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_06-02.md": {
	id: "fevral/daily_06-02.md";
  slug: "fevral/daily_06-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_07-02.md": {
	id: "fevral/daily_07-02.md";
  slug: "fevral/daily_07-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_08-02.md": {
	id: "fevral/daily_08-02.md";
  slug: "fevral/daily_08-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_09-02.md": {
	id: "fevral/daily_09-02.md";
  slug: "fevral/daily_09-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_10-02.md": {
	id: "fevral/daily_10-02.md";
  slug: "fevral/daily_10-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_11-02.md": {
	id: "fevral/daily_11-02.md";
  slug: "fevral/daily_11-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_12-02.md": {
	id: "fevral/daily_12-02.md";
  slug: "fevral/daily_12-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_13-02.md": {
	id: "fevral/daily_13-02.md";
  slug: "fevral/daily_13-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_14-02.md": {
	id: "fevral/daily_14-02.md";
  slug: "fevral/daily_14-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_15-02.md": {
	id: "fevral/daily_15-02.md";
  slug: "fevral/daily_15-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_16-02.md": {
	id: "fevral/daily_16-02.md";
  slug: "fevral/daily_16-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_17-02.md": {
	id: "fevral/daily_17-02.md";
  slug: "fevral/daily_17-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_18-02.md": {
	id: "fevral/daily_18-02.md";
  slug: "fevral/daily_18-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_19-02.md": {
	id: "fevral/daily_19-02.md";
  slug: "fevral/daily_19-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_20-02.md": {
	id: "fevral/daily_20-02.md";
  slug: "fevral/daily_20-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_21-02.md": {
	id: "fevral/daily_21-02.md";
  slug: "fevral/daily_21-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_22-02.md": {
	id: "fevral/daily_22-02.md";
  slug: "fevral/daily_22-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_23-02.md": {
	id: "fevral/daily_23-02.md";
  slug: "fevral/daily_23-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_24-02.md": {
	id: "fevral/daily_24-02.md";
  slug: "fevral/daily_24-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_25-02.md": {
	id: "fevral/daily_25-02.md";
  slug: "fevral/daily_25-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_26-02.md": {
	id: "fevral/daily_26-02.md";
  slug: "fevral/daily_26-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_27-02.md": {
	id: "fevral/daily_27-02.md";
  slug: "fevral/daily_27-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_28-02.md": {
	id: "fevral/daily_28-02.md";
  slug: "fevral/daily_28-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"fevral/daily_29-02.md": {
	id: "fevral/daily_29-02.md";
  slug: "fevral/daily_29-02";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_01-07.md": {
	id: "iyul/daily_01-07.md";
  slug: "iyul/daily_01-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_02-07.md": {
	id: "iyul/daily_02-07.md";
  slug: "iyul/daily_02-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_03-07.md": {
	id: "iyul/daily_03-07.md";
  slug: "iyul/daily_03-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_04-07.md": {
	id: "iyul/daily_04-07.md";
  slug: "iyul/daily_04-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_05-07.md": {
	id: "iyul/daily_05-07.md";
  slug: "iyul/daily_05-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_06-07.md": {
	id: "iyul/daily_06-07.md";
  slug: "iyul/daily_06-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_07-07.md": {
	id: "iyul/daily_07-07.md";
  slug: "iyul/daily_07-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_08-07.md": {
	id: "iyul/daily_08-07.md";
  slug: "iyul/daily_08-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_09-07.md": {
	id: "iyul/daily_09-07.md";
  slug: "iyul/daily_09-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_10-07.md": {
	id: "iyul/daily_10-07.md";
  slug: "iyul/daily_10-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_11-07.md": {
	id: "iyul/daily_11-07.md";
  slug: "iyul/daily_11-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_12-07.md": {
	id: "iyul/daily_12-07.md";
  slug: "iyul/daily_12-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_13-07.md": {
	id: "iyul/daily_13-07.md";
  slug: "iyul/daily_13-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_14-07.md": {
	id: "iyul/daily_14-07.md";
  slug: "iyul/daily_14-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_15-07.md": {
	id: "iyul/daily_15-07.md";
  slug: "iyul/daily_15-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_16-07.md": {
	id: "iyul/daily_16-07.md";
  slug: "iyul/daily_16-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_17-07.md": {
	id: "iyul/daily_17-07.md";
  slug: "iyul/daily_17-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_18-07.md": {
	id: "iyul/daily_18-07.md";
  slug: "iyul/daily_18-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_19-07.md": {
	id: "iyul/daily_19-07.md";
  slug: "iyul/daily_19-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_20-07.md": {
	id: "iyul/daily_20-07.md";
  slug: "iyul/daily_20-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_21-07.md": {
	id: "iyul/daily_21-07.md";
  slug: "iyul/daily_21-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_22-07.md": {
	id: "iyul/daily_22-07.md";
  slug: "iyul/daily_22-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_23-07.md": {
	id: "iyul/daily_23-07.md";
  slug: "iyul/daily_23-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_24-07.md": {
	id: "iyul/daily_24-07.md";
  slug: "iyul/daily_24-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_25-07.md": {
	id: "iyul/daily_25-07.md";
  slug: "iyul/daily_25-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_26-07.md": {
	id: "iyul/daily_26-07.md";
  slug: "iyul/daily_26-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_27-07.md": {
	id: "iyul/daily_27-07.md";
  slug: "iyul/daily_27-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_28-07.md": {
	id: "iyul/daily_28-07.md";
  slug: "iyul/daily_28-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_29-07.md": {
	id: "iyul/daily_29-07.md";
  slug: "iyul/daily_29-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_30-07.md": {
	id: "iyul/daily_30-07.md";
  slug: "iyul/daily_30-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyul/daily_31-07.md": {
	id: "iyul/daily_31-07.md";
  slug: "iyul/daily_31-07";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_01-06.md": {
	id: "iyun/daily_01-06.md";
  slug: "iyun/daily_01-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_02-06.md": {
	id: "iyun/daily_02-06.md";
  slug: "iyun/daily_02-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_03-06.md": {
	id: "iyun/daily_03-06.md";
  slug: "iyun/daily_03-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_04-06.md": {
	id: "iyun/daily_04-06.md";
  slug: "iyun/daily_04-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_05-06.md": {
	id: "iyun/daily_05-06.md";
  slug: "iyun/daily_05-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_06-06.md": {
	id: "iyun/daily_06-06.md";
  slug: "iyun/daily_06-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_07-06.md": {
	id: "iyun/daily_07-06.md";
  slug: "iyun/daily_07-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_08-06.md": {
	id: "iyun/daily_08-06.md";
  slug: "iyun/daily_08-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_09-06.md": {
	id: "iyun/daily_09-06.md";
  slug: "iyun/daily_09-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_10-06.md": {
	id: "iyun/daily_10-06.md";
  slug: "iyun/daily_10-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_11-06.md": {
	id: "iyun/daily_11-06.md";
  slug: "iyun/daily_11-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_12-06.md": {
	id: "iyun/daily_12-06.md";
  slug: "iyun/daily_12-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_13-06.md": {
	id: "iyun/daily_13-06.md";
  slug: "iyun/daily_13-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_14-06.md": {
	id: "iyun/daily_14-06.md";
  slug: "iyun/daily_14-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_15-06.md": {
	id: "iyun/daily_15-06.md";
  slug: "iyun/daily_15-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_16-06.md": {
	id: "iyun/daily_16-06.md";
  slug: "iyun/daily_16-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_17-06.md": {
	id: "iyun/daily_17-06.md";
  slug: "iyun/daily_17-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_18-06.md": {
	id: "iyun/daily_18-06.md";
  slug: "iyun/daily_18-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_19-06.md": {
	id: "iyun/daily_19-06.md";
  slug: "iyun/daily_19-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_20-06.md": {
	id: "iyun/daily_20-06.md";
  slug: "iyun/daily_20-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_21-06.md": {
	id: "iyun/daily_21-06.md";
  slug: "iyun/daily_21-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_22-06.md": {
	id: "iyun/daily_22-06.md";
  slug: "iyun/daily_22-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_23-06.md": {
	id: "iyun/daily_23-06.md";
  slug: "iyun/daily_23-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_24-06.md": {
	id: "iyun/daily_24-06.md";
  slug: "iyun/daily_24-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_25-06.md": {
	id: "iyun/daily_25-06.md";
  slug: "iyun/daily_25-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_26-06.md": {
	id: "iyun/daily_26-06.md";
  slug: "iyun/daily_26-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_27-06.md": {
	id: "iyun/daily_27-06.md";
  slug: "iyun/daily_27-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_28-06.md": {
	id: "iyun/daily_28-06.md";
  slug: "iyun/daily_28-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_29-06.md": {
	id: "iyun/daily_29-06.md";
  slug: "iyun/daily_29-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"iyun/daily_30-06.md": {
	id: "iyun/daily_30-06.md";
  slug: "iyun/daily_30-06";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_01-05.md": {
	id: "maj/daily_01-05.md";
  slug: "maj/daily_01-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_02-05.md": {
	id: "maj/daily_02-05.md";
  slug: "maj/daily_02-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_03-05.md": {
	id: "maj/daily_03-05.md";
  slug: "maj/daily_03-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_04-05.md": {
	id: "maj/daily_04-05.md";
  slug: "maj/daily_04-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_05-05.md": {
	id: "maj/daily_05-05.md";
  slug: "maj/daily_05-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_06-05.md": {
	id: "maj/daily_06-05.md";
  slug: "maj/daily_06-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_07-05.md": {
	id: "maj/daily_07-05.md";
  slug: "maj/daily_07-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_08-05.md": {
	id: "maj/daily_08-05.md";
  slug: "maj/daily_08-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_09-05.md": {
	id: "maj/daily_09-05.md";
  slug: "maj/daily_09-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_10-05.md": {
	id: "maj/daily_10-05.md";
  slug: "maj/daily_10-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_11-05.md": {
	id: "maj/daily_11-05.md";
  slug: "maj/daily_11-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_12-05.md": {
	id: "maj/daily_12-05.md";
  slug: "maj/daily_12-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_13-05.md": {
	id: "maj/daily_13-05.md";
  slug: "maj/daily_13-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_14-05.md": {
	id: "maj/daily_14-05.md";
  slug: "maj/daily_14-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_15-05.md": {
	id: "maj/daily_15-05.md";
  slug: "maj/daily_15-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_16-05.md": {
	id: "maj/daily_16-05.md";
  slug: "maj/daily_16-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_17-05.md": {
	id: "maj/daily_17-05.md";
  slug: "maj/daily_17-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_18-05.md": {
	id: "maj/daily_18-05.md";
  slug: "maj/daily_18-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_19-05.md": {
	id: "maj/daily_19-05.md";
  slug: "maj/daily_19-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_20-05.md": {
	id: "maj/daily_20-05.md";
  slug: "maj/daily_20-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_21-05.md": {
	id: "maj/daily_21-05.md";
  slug: "maj/daily_21-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_22-05.md": {
	id: "maj/daily_22-05.md";
  slug: "maj/daily_22-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_23-05.md": {
	id: "maj/daily_23-05.md";
  slug: "maj/daily_23-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_24-05.md": {
	id: "maj/daily_24-05.md";
  slug: "maj/daily_24-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_25-05.md": {
	id: "maj/daily_25-05.md";
  slug: "maj/daily_25-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_26-05.md": {
	id: "maj/daily_26-05.md";
  slug: "maj/daily_26-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_27-05.md": {
	id: "maj/daily_27-05.md";
  slug: "maj/daily_27-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_28-05.md": {
	id: "maj/daily_28-05.md";
  slug: "maj/daily_28-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_29-05.md": {
	id: "maj/daily_29-05.md";
  slug: "maj/daily_29-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_30-05.md": {
	id: "maj/daily_30-05.md";
  slug: "maj/daily_30-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"maj/daily_31-05.md": {
	id: "maj/daily_31-05.md";
  slug: "maj/daily_31-05";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_01-03.md": {
	id: "mart/daily_01-03.md";
  slug: "mart/daily_01-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_02-03.md": {
	id: "mart/daily_02-03.md";
  slug: "mart/daily_02-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_03-03.md": {
	id: "mart/daily_03-03.md";
  slug: "mart/daily_03-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_04-03.md": {
	id: "mart/daily_04-03.md";
  slug: "mart/daily_04-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_05-03.md": {
	id: "mart/daily_05-03.md";
  slug: "mart/daily_05-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_06-03.md": {
	id: "mart/daily_06-03.md";
  slug: "mart/daily_06-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_07-03.md": {
	id: "mart/daily_07-03.md";
  slug: "mart/daily_07-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_08-03.md": {
	id: "mart/daily_08-03.md";
  slug: "mart/daily_08-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_09-03.md": {
	id: "mart/daily_09-03.md";
  slug: "mart/daily_09-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_10-03.md": {
	id: "mart/daily_10-03.md";
  slug: "mart/daily_10-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_11-03.md": {
	id: "mart/daily_11-03.md";
  slug: "mart/daily_11-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_12-03.md": {
	id: "mart/daily_12-03.md";
  slug: "mart/daily_12-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_13-03.md": {
	id: "mart/daily_13-03.md";
  slug: "mart/daily_13-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_14-03.md": {
	id: "mart/daily_14-03.md";
  slug: "mart/daily_14-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_15-03.md": {
	id: "mart/daily_15-03.md";
  slug: "mart/daily_15-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_16-03.md": {
	id: "mart/daily_16-03.md";
  slug: "mart/daily_16-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_17-03.md": {
	id: "mart/daily_17-03.md";
  slug: "mart/daily_17-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_18-03.md": {
	id: "mart/daily_18-03.md";
  slug: "mart/daily_18-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_19-03.md": {
	id: "mart/daily_19-03.md";
  slug: "mart/daily_19-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_20-03.md": {
	id: "mart/daily_20-03.md";
  slug: "mart/daily_20-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_21-03.md": {
	id: "mart/daily_21-03.md";
  slug: "mart/daily_21-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_22-03.md": {
	id: "mart/daily_22-03.md";
  slug: "mart/daily_22-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_23-03.md": {
	id: "mart/daily_23-03.md";
  slug: "mart/daily_23-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_24-03.md": {
	id: "mart/daily_24-03.md";
  slug: "mart/daily_24-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_25-03.md": {
	id: "mart/daily_25-03.md";
  slug: "mart/daily_25-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_26-03.md": {
	id: "mart/daily_26-03.md";
  slug: "mart/daily_26-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_27-03.md": {
	id: "mart/daily_27-03.md";
  slug: "mart/daily_27-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_28-03.md": {
	id: "mart/daily_28-03.md";
  slug: "mart/daily_28-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_29-03.md": {
	id: "mart/daily_29-03.md";
  slug: "mart/daily_29-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_30-03.md": {
	id: "mart/daily_30-03.md";
  slug: "mart/daily_30-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"mart/daily_31-03.md": {
	id: "mart/daily_31-03.md";
  slug: "mart/daily_31-03";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_01-11.md": {
	id: "noyabr/daily_01-11.md";
  slug: "noyabr/daily_01-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_02-11.md": {
	id: "noyabr/daily_02-11.md";
  slug: "noyabr/daily_02-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_03-11.md": {
	id: "noyabr/daily_03-11.md";
  slug: "noyabr/daily_03-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_04-11.md": {
	id: "noyabr/daily_04-11.md";
  slug: "noyabr/daily_04-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_05-11.md": {
	id: "noyabr/daily_05-11.md";
  slug: "noyabr/daily_05-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_06-11.md": {
	id: "noyabr/daily_06-11.md";
  slug: "noyabr/daily_06-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_07-11.md": {
	id: "noyabr/daily_07-11.md";
  slug: "noyabr/daily_07-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_08-11.md": {
	id: "noyabr/daily_08-11.md";
  slug: "noyabr/daily_08-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_09-11.md": {
	id: "noyabr/daily_09-11.md";
  slug: "noyabr/daily_09-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_10-11.md": {
	id: "noyabr/daily_10-11.md";
  slug: "noyabr/daily_10-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_11-11.md": {
	id: "noyabr/daily_11-11.md";
  slug: "noyabr/daily_11-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_12-11.md": {
	id: "noyabr/daily_12-11.md";
  slug: "noyabr/daily_12-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_13-11.md": {
	id: "noyabr/daily_13-11.md";
  slug: "noyabr/daily_13-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_14-11.md": {
	id: "noyabr/daily_14-11.md";
  slug: "noyabr/daily_14-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_15-11.md": {
	id: "noyabr/daily_15-11.md";
  slug: "noyabr/daily_15-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_16-11.md": {
	id: "noyabr/daily_16-11.md";
  slug: "noyabr/daily_16-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_17-11.md": {
	id: "noyabr/daily_17-11.md";
  slug: "noyabr/daily_17-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_18-11.md": {
	id: "noyabr/daily_18-11.md";
  slug: "noyabr/daily_18-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_19-11.md": {
	id: "noyabr/daily_19-11.md";
  slug: "noyabr/daily_19-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_20-11.md": {
	id: "noyabr/daily_20-11.md";
  slug: "noyabr/daily_20-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_21-11.md": {
	id: "noyabr/daily_21-11.md";
  slug: "noyabr/daily_21-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_22-11.md": {
	id: "noyabr/daily_22-11.md";
  slug: "noyabr/daily_22-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_23-11.md": {
	id: "noyabr/daily_23-11.md";
  slug: "noyabr/daily_23-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_24-11.md": {
	id: "noyabr/daily_24-11.md";
  slug: "noyabr/daily_24-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_25-11.md": {
	id: "noyabr/daily_25-11.md";
  slug: "noyabr/daily_25-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_26-11.md": {
	id: "noyabr/daily_26-11.md";
  slug: "noyabr/daily_26-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_27-11.md": {
	id: "noyabr/daily_27-11.md";
  slug: "noyabr/daily_27-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_28-11.md": {
	id: "noyabr/daily_28-11.md";
  slug: "noyabr/daily_28-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_29-11.md": {
	id: "noyabr/daily_29-11.md";
  slug: "noyabr/daily_29-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"noyabr/daily_30-11.md": {
	id: "noyabr/daily_30-11.md";
  slug: "noyabr/daily_30-11";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_01-10.md": {
	id: "oktyabr/daily_01-10.md";
  slug: "oktyabr/daily_01-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_02-10.md": {
	id: "oktyabr/daily_02-10.md";
  slug: "oktyabr/daily_02-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_03-10.md": {
	id: "oktyabr/daily_03-10.md";
  slug: "oktyabr/daily_03-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_04-10.md": {
	id: "oktyabr/daily_04-10.md";
  slug: "oktyabr/daily_04-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_05-10.md": {
	id: "oktyabr/daily_05-10.md";
  slug: "oktyabr/daily_05-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_06-10.md": {
	id: "oktyabr/daily_06-10.md";
  slug: "oktyabr/daily_06-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_07-10.md": {
	id: "oktyabr/daily_07-10.md";
  slug: "oktyabr/daily_07-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_08-10.md": {
	id: "oktyabr/daily_08-10.md";
  slug: "oktyabr/daily_08-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_09-10.md": {
	id: "oktyabr/daily_09-10.md";
  slug: "oktyabr/daily_09-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_10-10.md": {
	id: "oktyabr/daily_10-10.md";
  slug: "oktyabr/daily_10-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_11-10.md": {
	id: "oktyabr/daily_11-10.md";
  slug: "oktyabr/daily_11-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_12-10.md": {
	id: "oktyabr/daily_12-10.md";
  slug: "oktyabr/daily_12-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_13-10.md": {
	id: "oktyabr/daily_13-10.md";
  slug: "oktyabr/daily_13-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_14-10.md": {
	id: "oktyabr/daily_14-10.md";
  slug: "oktyabr/daily_14-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_15-10.md": {
	id: "oktyabr/daily_15-10.md";
  slug: "oktyabr/daily_15-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_16-10.md": {
	id: "oktyabr/daily_16-10.md";
  slug: "oktyabr/daily_16-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_17-10.md": {
	id: "oktyabr/daily_17-10.md";
  slug: "oktyabr/daily_17-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_18-10.md": {
	id: "oktyabr/daily_18-10.md";
  slug: "oktyabr/daily_18-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_19-10.md": {
	id: "oktyabr/daily_19-10.md";
  slug: "oktyabr/daily_19-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_20-10.md": {
	id: "oktyabr/daily_20-10.md";
  slug: "oktyabr/daily_20-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_21-10.md": {
	id: "oktyabr/daily_21-10.md";
  slug: "oktyabr/daily_21-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_22-10.md": {
	id: "oktyabr/daily_22-10.md";
  slug: "oktyabr/daily_22-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_23-10.md": {
	id: "oktyabr/daily_23-10.md";
  slug: "oktyabr/daily_23-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_24-10.md": {
	id: "oktyabr/daily_24-10.md";
  slug: "oktyabr/daily_24-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_25-10.md": {
	id: "oktyabr/daily_25-10.md";
  slug: "oktyabr/daily_25-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_26-10.md": {
	id: "oktyabr/daily_26-10.md";
  slug: "oktyabr/daily_26-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_27-10.md": {
	id: "oktyabr/daily_27-10.md";
  slug: "oktyabr/daily_27-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_28-10.md": {
	id: "oktyabr/daily_28-10.md";
  slug: "oktyabr/daily_28-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_29-10.md": {
	id: "oktyabr/daily_29-10.md";
  slug: "oktyabr/daily_29-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_30-10.md": {
	id: "oktyabr/daily_30-10.md";
  slug: "oktyabr/daily_30-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"oktyabr/daily_31-10.md": {
	id: "oktyabr/daily_31-10.md";
  slug: "oktyabr/daily_31-10";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_01-09.md": {
	id: "sentyabr/daily_01-09.md";
  slug: "sentyabr/daily_01-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_02-09.md": {
	id: "sentyabr/daily_02-09.md";
  slug: "sentyabr/daily_02-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_03-09.md": {
	id: "sentyabr/daily_03-09.md";
  slug: "sentyabr/daily_03-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_04-09.md": {
	id: "sentyabr/daily_04-09.md";
  slug: "sentyabr/daily_04-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_05-09.md": {
	id: "sentyabr/daily_05-09.md";
  slug: "sentyabr/daily_05-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_06-09.md": {
	id: "sentyabr/daily_06-09.md";
  slug: "sentyabr/daily_06-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_07-09.md": {
	id: "sentyabr/daily_07-09.md";
  slug: "sentyabr/daily_07-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_08-09.md": {
	id: "sentyabr/daily_08-09.md";
  slug: "sentyabr/daily_08-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_09-09.md": {
	id: "sentyabr/daily_09-09.md";
  slug: "sentyabr/daily_09-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_10-09.md": {
	id: "sentyabr/daily_10-09.md";
  slug: "sentyabr/daily_10-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_11-09.md": {
	id: "sentyabr/daily_11-09.md";
  slug: "sentyabr/daily_11-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_12-09.md": {
	id: "sentyabr/daily_12-09.md";
  slug: "sentyabr/daily_12-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_13-09.md": {
	id: "sentyabr/daily_13-09.md";
  slug: "sentyabr/daily_13-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_14-09.md": {
	id: "sentyabr/daily_14-09.md";
  slug: "sentyabr/daily_14-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_15-09.md": {
	id: "sentyabr/daily_15-09.md";
  slug: "sentyabr/daily_15-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_16-09.md": {
	id: "sentyabr/daily_16-09.md";
  slug: "sentyabr/daily_16-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_17-09.md": {
	id: "sentyabr/daily_17-09.md";
  slug: "sentyabr/daily_17-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_18-09.md": {
	id: "sentyabr/daily_18-09.md";
  slug: "sentyabr/daily_18-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_19-09.md": {
	id: "sentyabr/daily_19-09.md";
  slug: "sentyabr/daily_19-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_20-09.md": {
	id: "sentyabr/daily_20-09.md";
  slug: "sentyabr/daily_20-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_21-09.md": {
	id: "sentyabr/daily_21-09.md";
  slug: "sentyabr/daily_21-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_22-09.md": {
	id: "sentyabr/daily_22-09.md";
  slug: "sentyabr/daily_22-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_23-09.md": {
	id: "sentyabr/daily_23-09.md";
  slug: "sentyabr/daily_23-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_24-09.md": {
	id: "sentyabr/daily_24-09.md";
  slug: "sentyabr/daily_24-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_25-09.md": {
	id: "sentyabr/daily_25-09.md";
  slug: "sentyabr/daily_25-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_26-09.md": {
	id: "sentyabr/daily_26-09.md";
  slug: "sentyabr/daily_26-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_27-09.md": {
	id: "sentyabr/daily_27-09.md";
  slug: "sentyabr/daily_27-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_28-09.md": {
	id: "sentyabr/daily_28-09.md";
  slug: "sentyabr/daily_28-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_29-09.md": {
	id: "sentyabr/daily_29-09.md";
  slug: "sentyabr/daily_29-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"sentyabr/daily_30-09.md": {
	id: "sentyabr/daily_30-09.md";
  slug: "sentyabr/daily_30-09";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_01-01.md": {
	id: "yanvar/daily_01-01.md";
  slug: "yanvar/daily_01-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_02-01.md": {
	id: "yanvar/daily_02-01.md";
  slug: "yanvar/daily_02-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_03-01.md": {
	id: "yanvar/daily_03-01.md";
  slug: "yanvar/daily_03-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_04-01.md": {
	id: "yanvar/daily_04-01.md";
  slug: "yanvar/daily_04-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_05-01.md": {
	id: "yanvar/daily_05-01.md";
  slug: "yanvar/daily_05-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_06-01.md": {
	id: "yanvar/daily_06-01.md";
  slug: "yanvar/daily_06-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_07-01.md": {
	id: "yanvar/daily_07-01.md";
  slug: "yanvar/daily_07-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_08-01.md": {
	id: "yanvar/daily_08-01.md";
  slug: "yanvar/daily_08-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_09-01.md": {
	id: "yanvar/daily_09-01.md";
  slug: "yanvar/daily_09-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_10-01.md": {
	id: "yanvar/daily_10-01.md";
  slug: "yanvar/daily_10-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_11-01.md": {
	id: "yanvar/daily_11-01.md";
  slug: "yanvar/daily_11-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_12-01.md": {
	id: "yanvar/daily_12-01.md";
  slug: "yanvar/daily_12-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_13-01.md": {
	id: "yanvar/daily_13-01.md";
  slug: "yanvar/daily_13-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_14-01.md": {
	id: "yanvar/daily_14-01.md";
  slug: "yanvar/daily_14-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_15-01.md": {
	id: "yanvar/daily_15-01.md";
  slug: "yanvar/daily_15-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_16-01.md": {
	id: "yanvar/daily_16-01.md";
  slug: "yanvar/daily_16-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_17-01.md": {
	id: "yanvar/daily_17-01.md";
  slug: "yanvar/daily_17-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_18-01.md": {
	id: "yanvar/daily_18-01.md";
  slug: "yanvar/daily_18-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_19-01.md": {
	id: "yanvar/daily_19-01.md";
  slug: "yanvar/daily_19-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_20-01.md": {
	id: "yanvar/daily_20-01.md";
  slug: "yanvar/daily_20-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_21-01.md": {
	id: "yanvar/daily_21-01.md";
  slug: "yanvar/daily_21-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_22-01.md": {
	id: "yanvar/daily_22-01.md";
  slug: "yanvar/daily_22-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_23-01.md": {
	id: "yanvar/daily_23-01.md";
  slug: "yanvar/daily_23-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_24-01.md": {
	id: "yanvar/daily_24-01.md";
  slug: "yanvar/daily_24-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_25-01.md": {
	id: "yanvar/daily_25-01.md";
  slug: "yanvar/daily_25-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_26-01.md": {
	id: "yanvar/daily_26-01.md";
  slug: "yanvar/daily_26-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_27-01.md": {
	id: "yanvar/daily_27-01.md";
  slug: "yanvar/daily_27-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_28-01.md": {
	id: "yanvar/daily_28-01.md";
  slug: "yanvar/daily_28-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_29-01.md": {
	id: "yanvar/daily_29-01.md";
  slug: "yanvar/daily_29-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_30-01.md": {
	id: "yanvar/daily_30-01.md";
  slug: "yanvar/daily_30-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
"yanvar/daily_31-01.md": {
	id: "yanvar/daily_31-01.md";
  slug: "yanvar/daily_31-01";
  body: string;
  collection: "an";
  data: InferEntrySchema<"an">
} & { render(): Render[".md"] };
};
"beattiem": {
"april/daily_01-04.md": {
	id: "april/daily_01-04.md";
  slug: "april/daily_01-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_02-04.md": {
	id: "april/daily_02-04.md";
  slug: "april/daily_02-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_03-04.md": {
	id: "april/daily_03-04.md";
  slug: "april/daily_03-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_04-04.md": {
	id: "april/daily_04-04.md";
  slug: "april/daily_04-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_05-04.md": {
	id: "april/daily_05-04.md";
  slug: "april/daily_05-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_06-04.md": {
	id: "april/daily_06-04.md";
  slug: "april/daily_06-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_07-04.md": {
	id: "april/daily_07-04.md";
  slug: "april/daily_07-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_08-04.md": {
	id: "april/daily_08-04.md";
  slug: "april/daily_08-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_09-04.md": {
	id: "april/daily_09-04.md";
  slug: "april/daily_09-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_10-04.md": {
	id: "april/daily_10-04.md";
  slug: "april/daily_10-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_11-04.md": {
	id: "april/daily_11-04.md";
  slug: "april/daily_11-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_12-04.md": {
	id: "april/daily_12-04.md";
  slug: "april/daily_12-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_13-04.md": {
	id: "april/daily_13-04.md";
  slug: "april/daily_13-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_14-04.md": {
	id: "april/daily_14-04.md";
  slug: "april/daily_14-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_15-04.md": {
	id: "april/daily_15-04.md";
  slug: "april/daily_15-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_16-04.md": {
	id: "april/daily_16-04.md";
  slug: "april/daily_16-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_17-04.md": {
	id: "april/daily_17-04.md";
  slug: "april/daily_17-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_18-04.md": {
	id: "april/daily_18-04.md";
  slug: "april/daily_18-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_19-04.md": {
	id: "april/daily_19-04.md";
  slug: "april/daily_19-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_20-04.md": {
	id: "april/daily_20-04.md";
  slug: "april/daily_20-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_21-04.md": {
	id: "april/daily_21-04.md";
  slug: "april/daily_21-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_22-04.md": {
	id: "april/daily_22-04.md";
  slug: "april/daily_22-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_23-04.md": {
	id: "april/daily_23-04.md";
  slug: "april/daily_23-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_24-04.md": {
	id: "april/daily_24-04.md";
  slug: "april/daily_24-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_25-04.md": {
	id: "april/daily_25-04.md";
  slug: "april/daily_25-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_26-04.md": {
	id: "april/daily_26-04.md";
  slug: "april/daily_26-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_27-04.md": {
	id: "april/daily_27-04.md";
  slug: "april/daily_27-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_28-04.md": {
	id: "april/daily_28-04.md";
  slug: "april/daily_28-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_29-04.md": {
	id: "april/daily_29-04.md";
  slug: "april/daily_29-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"april/daily_30-04.md": {
	id: "april/daily_30-04.md";
  slug: "april/daily_30-04";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_01-08.md": {
	id: "avgust/daily_01-08.md";
  slug: "avgust/daily_01-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_02-08.md": {
	id: "avgust/daily_02-08.md";
  slug: "avgust/daily_02-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_03-08.md": {
	id: "avgust/daily_03-08.md";
  slug: "avgust/daily_03-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_04-08.md": {
	id: "avgust/daily_04-08.md";
  slug: "avgust/daily_04-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_05-08.md": {
	id: "avgust/daily_05-08.md";
  slug: "avgust/daily_05-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_06-08.md": {
	id: "avgust/daily_06-08.md";
  slug: "avgust/daily_06-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_07-08.md": {
	id: "avgust/daily_07-08.md";
  slug: "avgust/daily_07-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_08-08.md": {
	id: "avgust/daily_08-08.md";
  slug: "avgust/daily_08-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_09-08.md": {
	id: "avgust/daily_09-08.md";
  slug: "avgust/daily_09-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_10-08.md": {
	id: "avgust/daily_10-08.md";
  slug: "avgust/daily_10-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_11-08.md": {
	id: "avgust/daily_11-08.md";
  slug: "avgust/daily_11-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_12-08.md": {
	id: "avgust/daily_12-08.md";
  slug: "avgust/daily_12-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_13-08.md": {
	id: "avgust/daily_13-08.md";
  slug: "avgust/daily_13-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_14-08.md": {
	id: "avgust/daily_14-08.md";
  slug: "avgust/daily_14-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_15-08.md": {
	id: "avgust/daily_15-08.md";
  slug: "avgust/daily_15-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_16-08.md": {
	id: "avgust/daily_16-08.md";
  slug: "avgust/daily_16-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_17-08.md": {
	id: "avgust/daily_17-08.md";
  slug: "avgust/daily_17-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_18-08.md": {
	id: "avgust/daily_18-08.md";
  slug: "avgust/daily_18-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_19-08.md": {
	id: "avgust/daily_19-08.md";
  slug: "avgust/daily_19-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_20-08.md": {
	id: "avgust/daily_20-08.md";
  slug: "avgust/daily_20-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_21-08.md": {
	id: "avgust/daily_21-08.md";
  slug: "avgust/daily_21-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_22-08.md": {
	id: "avgust/daily_22-08.md";
  slug: "avgust/daily_22-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_23-08.md": {
	id: "avgust/daily_23-08.md";
  slug: "avgust/daily_23-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_24-08.md": {
	id: "avgust/daily_24-08.md";
  slug: "avgust/daily_24-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_25-08.md": {
	id: "avgust/daily_25-08.md";
  slug: "avgust/daily_25-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_26-08.md": {
	id: "avgust/daily_26-08.md";
  slug: "avgust/daily_26-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_27-08.md": {
	id: "avgust/daily_27-08.md";
  slug: "avgust/daily_27-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_28-08.md": {
	id: "avgust/daily_28-08.md";
  slug: "avgust/daily_28-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_29-08.md": {
	id: "avgust/daily_29-08.md";
  slug: "avgust/daily_29-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_30-08.md": {
	id: "avgust/daily_30-08.md";
  slug: "avgust/daily_30-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"avgust/daily_31-08.md": {
	id: "avgust/daily_31-08.md";
  slug: "avgust/daily_31-08";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_01-12.md": {
	id: "dekabr/daily_01-12.md";
  slug: "dekabr/daily_01-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_02-12.md": {
	id: "dekabr/daily_02-12.md";
  slug: "dekabr/daily_02-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_03-12.md": {
	id: "dekabr/daily_03-12.md";
  slug: "dekabr/daily_03-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_04-12.md": {
	id: "dekabr/daily_04-12.md";
  slug: "dekabr/daily_04-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_05-12.md": {
	id: "dekabr/daily_05-12.md";
  slug: "dekabr/daily_05-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_06-12.md": {
	id: "dekabr/daily_06-12.md";
  slug: "dekabr/daily_06-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_07-12.md": {
	id: "dekabr/daily_07-12.md";
  slug: "dekabr/daily_07-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_08-12.md": {
	id: "dekabr/daily_08-12.md";
  slug: "dekabr/daily_08-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_09-12.md": {
	id: "dekabr/daily_09-12.md";
  slug: "dekabr/daily_09-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_10-12.md": {
	id: "dekabr/daily_10-12.md";
  slug: "dekabr/daily_10-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_11-12.md": {
	id: "dekabr/daily_11-12.md";
  slug: "dekabr/daily_11-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_12-12.md": {
	id: "dekabr/daily_12-12.md";
  slug: "dekabr/daily_12-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_13-12.md": {
	id: "dekabr/daily_13-12.md";
  slug: "dekabr/daily_13-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_14-12.md": {
	id: "dekabr/daily_14-12.md";
  slug: "dekabr/daily_14-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_15-12.md": {
	id: "dekabr/daily_15-12.md";
  slug: "dekabr/daily_15-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_16-12.md": {
	id: "dekabr/daily_16-12.md";
  slug: "dekabr/daily_16-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_17-12.md": {
	id: "dekabr/daily_17-12.md";
  slug: "dekabr/daily_17-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_18-12.md": {
	id: "dekabr/daily_18-12.md";
  slug: "dekabr/daily_18-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_19-12.md": {
	id: "dekabr/daily_19-12.md";
  slug: "dekabr/daily_19-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_20-12.md": {
	id: "dekabr/daily_20-12.md";
  slug: "dekabr/daily_20-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_21-12.md": {
	id: "dekabr/daily_21-12.md";
  slug: "dekabr/daily_21-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_22-12.md": {
	id: "dekabr/daily_22-12.md";
  slug: "dekabr/daily_22-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_23-12.md": {
	id: "dekabr/daily_23-12.md";
  slug: "dekabr/daily_23-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_24-12.md": {
	id: "dekabr/daily_24-12.md";
  slug: "dekabr/daily_24-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_25-12.md": {
	id: "dekabr/daily_25-12.md";
  slug: "dekabr/daily_25-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_26-12.md": {
	id: "dekabr/daily_26-12.md";
  slug: "dekabr/daily_26-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_27-12.md": {
	id: "dekabr/daily_27-12.md";
  slug: "dekabr/daily_27-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_28-12.md": {
	id: "dekabr/daily_28-12.md";
  slug: "dekabr/daily_28-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_29-12.md": {
	id: "dekabr/daily_29-12.md";
  slug: "dekabr/daily_29-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_30-12.md": {
	id: "dekabr/daily_30-12.md";
  slug: "dekabr/daily_30-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_31-12.md": {
	id: "dekabr/daily_31-12.md";
  slug: "dekabr/daily_31-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"dekabr/daily_32-12.md": {
	id: "dekabr/daily_32-12.md";
  slug: "dekabr/daily_32-12";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_01-02.md": {
	id: "fevral/daily_01-02.md";
  slug: "fevral/daily_01-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_02-02.md": {
	id: "fevral/daily_02-02.md";
  slug: "fevral/daily_02-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_03-02.md": {
	id: "fevral/daily_03-02.md";
  slug: "fevral/daily_03-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_04-02.md": {
	id: "fevral/daily_04-02.md";
  slug: "fevral/daily_04-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_05-02.md": {
	id: "fevral/daily_05-02.md";
  slug: "fevral/daily_05-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_06-02.md": {
	id: "fevral/daily_06-02.md";
  slug: "fevral/daily_06-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_07-02.md": {
	id: "fevral/daily_07-02.md";
  slug: "fevral/daily_07-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_08-02.md": {
	id: "fevral/daily_08-02.md";
  slug: "fevral/daily_08-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_09-02.md": {
	id: "fevral/daily_09-02.md";
  slug: "fevral/daily_09-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_10-02.md": {
	id: "fevral/daily_10-02.md";
  slug: "fevral/daily_10-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_11-02.md": {
	id: "fevral/daily_11-02.md";
  slug: "fevral/daily_11-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_12-02.md": {
	id: "fevral/daily_12-02.md";
  slug: "fevral/daily_12-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_13-02.md": {
	id: "fevral/daily_13-02.md";
  slug: "fevral/daily_13-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_14-02.md": {
	id: "fevral/daily_14-02.md";
  slug: "fevral/daily_14-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_15-02.md": {
	id: "fevral/daily_15-02.md";
  slug: "fevral/daily_15-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_16-02.md": {
	id: "fevral/daily_16-02.md";
  slug: "fevral/daily_16-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_17-02.md": {
	id: "fevral/daily_17-02.md";
  slug: "fevral/daily_17-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_18-02.md": {
	id: "fevral/daily_18-02.md";
  slug: "fevral/daily_18-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_19-02.md": {
	id: "fevral/daily_19-02.md";
  slug: "fevral/daily_19-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_20-02.md": {
	id: "fevral/daily_20-02.md";
  slug: "fevral/daily_20-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_21-02.md": {
	id: "fevral/daily_21-02.md";
  slug: "fevral/daily_21-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_22-02.md": {
	id: "fevral/daily_22-02.md";
  slug: "fevral/daily_22-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_23-02.md": {
	id: "fevral/daily_23-02.md";
  slug: "fevral/daily_23-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_24-02.md": {
	id: "fevral/daily_24-02.md";
  slug: "fevral/daily_24-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_25-02.md": {
	id: "fevral/daily_25-02.md";
  slug: "fevral/daily_25-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_26-02.md": {
	id: "fevral/daily_26-02.md";
  slug: "fevral/daily_26-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_27-02.md": {
	id: "fevral/daily_27-02.md";
  slug: "fevral/daily_27-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_28-02.md": {
	id: "fevral/daily_28-02.md";
  slug: "fevral/daily_28-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"fevral/daily_29-02.md": {
	id: "fevral/daily_29-02.md";
  slug: "fevral/daily_29-02";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_01-07.md": {
	id: "iyul/daily_01-07.md";
  slug: "iyul/daily_01-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_02-07.md": {
	id: "iyul/daily_02-07.md";
  slug: "iyul/daily_02-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_03-07.md": {
	id: "iyul/daily_03-07.md";
  slug: "iyul/daily_03-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_04-07.md": {
	id: "iyul/daily_04-07.md";
  slug: "iyul/daily_04-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_05-07.md": {
	id: "iyul/daily_05-07.md";
  slug: "iyul/daily_05-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_06-07.md": {
	id: "iyul/daily_06-07.md";
  slug: "iyul/daily_06-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_07-07.md": {
	id: "iyul/daily_07-07.md";
  slug: "iyul/daily_07-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_08-07.md": {
	id: "iyul/daily_08-07.md";
  slug: "iyul/daily_08-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_09-07.md": {
	id: "iyul/daily_09-07.md";
  slug: "iyul/daily_09-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_10-07.md": {
	id: "iyul/daily_10-07.md";
  slug: "iyul/daily_10-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_11-07.md": {
	id: "iyul/daily_11-07.md";
  slug: "iyul/daily_11-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_12-07.md": {
	id: "iyul/daily_12-07.md";
  slug: "iyul/daily_12-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_13-07.md": {
	id: "iyul/daily_13-07.md";
  slug: "iyul/daily_13-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_14-07.md": {
	id: "iyul/daily_14-07.md";
  slug: "iyul/daily_14-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_15-07.md": {
	id: "iyul/daily_15-07.md";
  slug: "iyul/daily_15-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_16-07.md": {
	id: "iyul/daily_16-07.md";
  slug: "iyul/daily_16-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_17-07.md": {
	id: "iyul/daily_17-07.md";
  slug: "iyul/daily_17-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_18-07.md": {
	id: "iyul/daily_18-07.md";
  slug: "iyul/daily_18-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_19-07.md": {
	id: "iyul/daily_19-07.md";
  slug: "iyul/daily_19-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_20-07.md": {
	id: "iyul/daily_20-07.md";
  slug: "iyul/daily_20-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_21-07.md": {
	id: "iyul/daily_21-07.md";
  slug: "iyul/daily_21-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_22-07.md": {
	id: "iyul/daily_22-07.md";
  slug: "iyul/daily_22-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_23-07.md": {
	id: "iyul/daily_23-07.md";
  slug: "iyul/daily_23-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_24-07.md": {
	id: "iyul/daily_24-07.md";
  slug: "iyul/daily_24-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_25-07.md": {
	id: "iyul/daily_25-07.md";
  slug: "iyul/daily_25-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_26-07.md": {
	id: "iyul/daily_26-07.md";
  slug: "iyul/daily_26-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_27-07.md": {
	id: "iyul/daily_27-07.md";
  slug: "iyul/daily_27-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_28-07.md": {
	id: "iyul/daily_28-07.md";
  slug: "iyul/daily_28-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_29-07.md": {
	id: "iyul/daily_29-07.md";
  slug: "iyul/daily_29-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_30-07.md": {
	id: "iyul/daily_30-07.md";
  slug: "iyul/daily_30-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyul/daily_31-07.md": {
	id: "iyul/daily_31-07.md";
  slug: "iyul/daily_31-07";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_01-06.md": {
	id: "iyun/daily_01-06.md";
  slug: "iyun/daily_01-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_02-06.md": {
	id: "iyun/daily_02-06.md";
  slug: "iyun/daily_02-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_03-06.md": {
	id: "iyun/daily_03-06.md";
  slug: "iyun/daily_03-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_04-06.md": {
	id: "iyun/daily_04-06.md";
  slug: "iyun/daily_04-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_05-06.md": {
	id: "iyun/daily_05-06.md";
  slug: "iyun/daily_05-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_06-06.md": {
	id: "iyun/daily_06-06.md";
  slug: "iyun/daily_06-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_07-06.md": {
	id: "iyun/daily_07-06.md";
  slug: "iyun/daily_07-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_08-06.md": {
	id: "iyun/daily_08-06.md";
  slug: "iyun/daily_08-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_09-06.md": {
	id: "iyun/daily_09-06.md";
  slug: "iyun/daily_09-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_10-06.md": {
	id: "iyun/daily_10-06.md";
  slug: "iyun/daily_10-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_11-06.md": {
	id: "iyun/daily_11-06.md";
  slug: "iyun/daily_11-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_12-06.md": {
	id: "iyun/daily_12-06.md";
  slug: "iyun/daily_12-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_13-06.md": {
	id: "iyun/daily_13-06.md";
  slug: "iyun/daily_13-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_14-06.md": {
	id: "iyun/daily_14-06.md";
  slug: "iyun/daily_14-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_15-06.md": {
	id: "iyun/daily_15-06.md";
  slug: "iyun/daily_15-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_16-06.md": {
	id: "iyun/daily_16-06.md";
  slug: "iyun/daily_16-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_17-06.md": {
	id: "iyun/daily_17-06.md";
  slug: "iyun/daily_17-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_18-06.md": {
	id: "iyun/daily_18-06.md";
  slug: "iyun/daily_18-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_19-06.md": {
	id: "iyun/daily_19-06.md";
  slug: "iyun/daily_19-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_20-06.md": {
	id: "iyun/daily_20-06.md";
  slug: "iyun/daily_20-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_21-06.md": {
	id: "iyun/daily_21-06.md";
  slug: "iyun/daily_21-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_22-06.md": {
	id: "iyun/daily_22-06.md";
  slug: "iyun/daily_22-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_23-06.md": {
	id: "iyun/daily_23-06.md";
  slug: "iyun/daily_23-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_24-06.md": {
	id: "iyun/daily_24-06.md";
  slug: "iyun/daily_24-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_25-06.md": {
	id: "iyun/daily_25-06.md";
  slug: "iyun/daily_25-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_26-06.md": {
	id: "iyun/daily_26-06.md";
  slug: "iyun/daily_26-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_27-06.md": {
	id: "iyun/daily_27-06.md";
  slug: "iyun/daily_27-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_28-06.md": {
	id: "iyun/daily_28-06.md";
  slug: "iyun/daily_28-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_29-06.md": {
	id: "iyun/daily_29-06.md";
  slug: "iyun/daily_29-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"iyun/daily_30-06.md": {
	id: "iyun/daily_30-06.md";
  slug: "iyun/daily_30-06";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_01-05.md": {
	id: "maj/daily_01-05.md";
  slug: "maj/daily_01-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_02-05.md": {
	id: "maj/daily_02-05.md";
  slug: "maj/daily_02-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_03-05.md": {
	id: "maj/daily_03-05.md";
  slug: "maj/daily_03-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_04-05.md": {
	id: "maj/daily_04-05.md";
  slug: "maj/daily_04-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_05-05.md": {
	id: "maj/daily_05-05.md";
  slug: "maj/daily_05-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_06-05.md": {
	id: "maj/daily_06-05.md";
  slug: "maj/daily_06-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_07-05.md": {
	id: "maj/daily_07-05.md";
  slug: "maj/daily_07-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_08-05.md": {
	id: "maj/daily_08-05.md";
  slug: "maj/daily_08-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_09-05.md": {
	id: "maj/daily_09-05.md";
  slug: "maj/daily_09-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_10-05.md": {
	id: "maj/daily_10-05.md";
  slug: "maj/daily_10-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_11-05.md": {
	id: "maj/daily_11-05.md";
  slug: "maj/daily_11-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_12-05.md": {
	id: "maj/daily_12-05.md";
  slug: "maj/daily_12-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_13-05.md": {
	id: "maj/daily_13-05.md";
  slug: "maj/daily_13-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_14-05.md": {
	id: "maj/daily_14-05.md";
  slug: "maj/daily_14-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_15-05.md": {
	id: "maj/daily_15-05.md";
  slug: "maj/daily_15-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_16-05.md": {
	id: "maj/daily_16-05.md";
  slug: "maj/daily_16-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_17-05.md": {
	id: "maj/daily_17-05.md";
  slug: "maj/daily_17-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_18-05.md": {
	id: "maj/daily_18-05.md";
  slug: "maj/daily_18-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_19-05.md": {
	id: "maj/daily_19-05.md";
  slug: "maj/daily_19-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_20-05.md": {
	id: "maj/daily_20-05.md";
  slug: "maj/daily_20-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_21-05.md": {
	id: "maj/daily_21-05.md";
  slug: "maj/daily_21-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_22-05.md": {
	id: "maj/daily_22-05.md";
  slug: "maj/daily_22-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_23-05.md": {
	id: "maj/daily_23-05.md";
  slug: "maj/daily_23-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_24-05.md": {
	id: "maj/daily_24-05.md";
  slug: "maj/daily_24-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_25-05.md": {
	id: "maj/daily_25-05.md";
  slug: "maj/daily_25-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_26-05.md": {
	id: "maj/daily_26-05.md";
  slug: "maj/daily_26-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_27-05.md": {
	id: "maj/daily_27-05.md";
  slug: "maj/daily_27-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_28-05.md": {
	id: "maj/daily_28-05.md";
  slug: "maj/daily_28-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_29-05.md": {
	id: "maj/daily_29-05.md";
  slug: "maj/daily_29-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_30-05.md": {
	id: "maj/daily_30-05.md";
  slug: "maj/daily_30-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"maj/daily_31-05.md": {
	id: "maj/daily_31-05.md";
  slug: "maj/daily_31-05";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_01-03.md": {
	id: "mart/daily_01-03.md";
  slug: "mart/daily_01-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_02-03.md": {
	id: "mart/daily_02-03.md";
  slug: "mart/daily_02-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_03-03.md": {
	id: "mart/daily_03-03.md";
  slug: "mart/daily_03-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_04-03.md": {
	id: "mart/daily_04-03.md";
  slug: "mart/daily_04-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_05-03.md": {
	id: "mart/daily_05-03.md";
  slug: "mart/daily_05-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_06-03.md": {
	id: "mart/daily_06-03.md";
  slug: "mart/daily_06-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_07-03.md": {
	id: "mart/daily_07-03.md";
  slug: "mart/daily_07-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_08-03.md": {
	id: "mart/daily_08-03.md";
  slug: "mart/daily_08-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_09-03.md": {
	id: "mart/daily_09-03.md";
  slug: "mart/daily_09-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_10-03.md": {
	id: "mart/daily_10-03.md";
  slug: "mart/daily_10-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_11-03.md": {
	id: "mart/daily_11-03.md";
  slug: "mart/daily_11-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_12-03.md": {
	id: "mart/daily_12-03.md";
  slug: "mart/daily_12-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_13-03.md": {
	id: "mart/daily_13-03.md";
  slug: "mart/daily_13-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_14-03.md": {
	id: "mart/daily_14-03.md";
  slug: "mart/daily_14-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_15-03.md": {
	id: "mart/daily_15-03.md";
  slug: "mart/daily_15-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_16-03.md": {
	id: "mart/daily_16-03.md";
  slug: "mart/daily_16-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_17-03.md": {
	id: "mart/daily_17-03.md";
  slug: "mart/daily_17-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_18-03.md": {
	id: "mart/daily_18-03.md";
  slug: "mart/daily_18-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_19-03.md": {
	id: "mart/daily_19-03.md";
  slug: "mart/daily_19-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_20-03.md": {
	id: "mart/daily_20-03.md";
  slug: "mart/daily_20-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_21-03.md": {
	id: "mart/daily_21-03.md";
  slug: "mart/daily_21-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_22-03.md": {
	id: "mart/daily_22-03.md";
  slug: "mart/daily_22-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_23-03.md": {
	id: "mart/daily_23-03.md";
  slug: "mart/daily_23-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_24-03.md": {
	id: "mart/daily_24-03.md";
  slug: "mart/daily_24-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_25-03.md": {
	id: "mart/daily_25-03.md";
  slug: "mart/daily_25-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_26-03.md": {
	id: "mart/daily_26-03.md";
  slug: "mart/daily_26-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_27-03.md": {
	id: "mart/daily_27-03.md";
  slug: "mart/daily_27-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_28-03.md": {
	id: "mart/daily_28-03.md";
  slug: "mart/daily_28-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_29-03.md": {
	id: "mart/daily_29-03.md";
  slug: "mart/daily_29-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_30-03.md": {
	id: "mart/daily_30-03.md";
  slug: "mart/daily_30-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"mart/daily_31-03.md": {
	id: "mart/daily_31-03.md";
  slug: "mart/daily_31-03";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_01-11.md": {
	id: "noyabr/daily_01-11.md";
  slug: "noyabr/daily_01-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_02-11.md": {
	id: "noyabr/daily_02-11.md";
  slug: "noyabr/daily_02-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_03-11.md": {
	id: "noyabr/daily_03-11.md";
  slug: "noyabr/daily_03-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_04-11.md": {
	id: "noyabr/daily_04-11.md";
  slug: "noyabr/daily_04-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_05-11.md": {
	id: "noyabr/daily_05-11.md";
  slug: "noyabr/daily_05-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_06-11.md": {
	id: "noyabr/daily_06-11.md";
  slug: "noyabr/daily_06-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_07-11.md": {
	id: "noyabr/daily_07-11.md";
  slug: "noyabr/daily_07-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_08-11.md": {
	id: "noyabr/daily_08-11.md";
  slug: "noyabr/daily_08-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_09-11.md": {
	id: "noyabr/daily_09-11.md";
  slug: "noyabr/daily_09-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_10-11.md": {
	id: "noyabr/daily_10-11.md";
  slug: "noyabr/daily_10-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_11-11.md": {
	id: "noyabr/daily_11-11.md";
  slug: "noyabr/daily_11-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_12-11.md": {
	id: "noyabr/daily_12-11.md";
  slug: "noyabr/daily_12-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_13-11.md": {
	id: "noyabr/daily_13-11.md";
  slug: "noyabr/daily_13-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_14-11.md": {
	id: "noyabr/daily_14-11.md";
  slug: "noyabr/daily_14-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_15-11.md": {
	id: "noyabr/daily_15-11.md";
  slug: "noyabr/daily_15-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_16-11.md": {
	id: "noyabr/daily_16-11.md";
  slug: "noyabr/daily_16-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_17-11.md": {
	id: "noyabr/daily_17-11.md";
  slug: "noyabr/daily_17-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_18-11.md": {
	id: "noyabr/daily_18-11.md";
  slug: "noyabr/daily_18-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_19-11.md": {
	id: "noyabr/daily_19-11.md";
  slug: "noyabr/daily_19-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_20-11.md": {
	id: "noyabr/daily_20-11.md";
  slug: "noyabr/daily_20-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_21-11.md": {
	id: "noyabr/daily_21-11.md";
  slug: "noyabr/daily_21-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_22-11.md": {
	id: "noyabr/daily_22-11.md";
  slug: "noyabr/daily_22-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_23-11.md": {
	id: "noyabr/daily_23-11.md";
  slug: "noyabr/daily_23-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_24-11.md": {
	id: "noyabr/daily_24-11.md";
  slug: "noyabr/daily_24-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_25-11.md": {
	id: "noyabr/daily_25-11.md";
  slug: "noyabr/daily_25-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_26-11.md": {
	id: "noyabr/daily_26-11.md";
  slug: "noyabr/daily_26-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_27-11.md": {
	id: "noyabr/daily_27-11.md";
  slug: "noyabr/daily_27-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_28-11.md": {
	id: "noyabr/daily_28-11.md";
  slug: "noyabr/daily_28-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_29-11.md": {
	id: "noyabr/daily_29-11.md";
  slug: "noyabr/daily_29-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"noyabr/daily_30-11.md": {
	id: "noyabr/daily_30-11.md";
  slug: "noyabr/daily_30-11";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_01-10.md": {
	id: "oktyabr/daily_01-10.md";
  slug: "oktyabr/daily_01-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_02-10.md": {
	id: "oktyabr/daily_02-10.md";
  slug: "oktyabr/daily_02-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_03-10.md": {
	id: "oktyabr/daily_03-10.md";
  slug: "oktyabr/daily_03-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_04-10.md": {
	id: "oktyabr/daily_04-10.md";
  slug: "oktyabr/daily_04-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_05-10.md": {
	id: "oktyabr/daily_05-10.md";
  slug: "oktyabr/daily_05-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_06-10.md": {
	id: "oktyabr/daily_06-10.md";
  slug: "oktyabr/daily_06-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_07-10.md": {
	id: "oktyabr/daily_07-10.md";
  slug: "oktyabr/daily_07-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_08-10.md": {
	id: "oktyabr/daily_08-10.md";
  slug: "oktyabr/daily_08-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_09-10.md": {
	id: "oktyabr/daily_09-10.md";
  slug: "oktyabr/daily_09-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_10-10.md": {
	id: "oktyabr/daily_10-10.md";
  slug: "oktyabr/daily_10-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_11-10.md": {
	id: "oktyabr/daily_11-10.md";
  slug: "oktyabr/daily_11-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_12-10.md": {
	id: "oktyabr/daily_12-10.md";
  slug: "oktyabr/daily_12-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_13-10.md": {
	id: "oktyabr/daily_13-10.md";
  slug: "oktyabr/daily_13-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_14-10.md": {
	id: "oktyabr/daily_14-10.md";
  slug: "oktyabr/daily_14-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_15-10.md": {
	id: "oktyabr/daily_15-10.md";
  slug: "oktyabr/daily_15-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_16-10.md": {
	id: "oktyabr/daily_16-10.md";
  slug: "oktyabr/daily_16-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_17-10.md": {
	id: "oktyabr/daily_17-10.md";
  slug: "oktyabr/daily_17-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_18-10.md": {
	id: "oktyabr/daily_18-10.md";
  slug: "oktyabr/daily_18-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_19-10.md": {
	id: "oktyabr/daily_19-10.md";
  slug: "oktyabr/daily_19-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_20-10.md": {
	id: "oktyabr/daily_20-10.md";
  slug: "oktyabr/daily_20-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_21-10.md": {
	id: "oktyabr/daily_21-10.md";
  slug: "oktyabr/daily_21-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_22-10.md": {
	id: "oktyabr/daily_22-10.md";
  slug: "oktyabr/daily_22-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_23-10.md": {
	id: "oktyabr/daily_23-10.md";
  slug: "oktyabr/daily_23-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_24-10.md": {
	id: "oktyabr/daily_24-10.md";
  slug: "oktyabr/daily_24-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_25-10.md": {
	id: "oktyabr/daily_25-10.md";
  slug: "oktyabr/daily_25-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_26-10.md": {
	id: "oktyabr/daily_26-10.md";
  slug: "oktyabr/daily_26-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_27-10.md": {
	id: "oktyabr/daily_27-10.md";
  slug: "oktyabr/daily_27-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_28-10.md": {
	id: "oktyabr/daily_28-10.md";
  slug: "oktyabr/daily_28-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_29-10.md": {
	id: "oktyabr/daily_29-10.md";
  slug: "oktyabr/daily_29-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_30-10.md": {
	id: "oktyabr/daily_30-10.md";
  slug: "oktyabr/daily_30-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"oktyabr/daily_31-10.md": {
	id: "oktyabr/daily_31-10.md";
  slug: "oktyabr/daily_31-10";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_01-09.md": {
	id: "sentyabr/daily_01-09.md";
  slug: "sentyabr/daily_01-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_02-09.md": {
	id: "sentyabr/daily_02-09.md";
  slug: "sentyabr/daily_02-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_03-09.md": {
	id: "sentyabr/daily_03-09.md";
  slug: "sentyabr/daily_03-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_04-09.md": {
	id: "sentyabr/daily_04-09.md";
  slug: "sentyabr/daily_04-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_05-09.md": {
	id: "sentyabr/daily_05-09.md";
  slug: "sentyabr/daily_05-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_06-09.md": {
	id: "sentyabr/daily_06-09.md";
  slug: "sentyabr/daily_06-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_07-09.md": {
	id: "sentyabr/daily_07-09.md";
  slug: "sentyabr/daily_07-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_08-09.md": {
	id: "sentyabr/daily_08-09.md";
  slug: "sentyabr/daily_08-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_09-09.md": {
	id: "sentyabr/daily_09-09.md";
  slug: "sentyabr/daily_09-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_10-09.md": {
	id: "sentyabr/daily_10-09.md";
  slug: "sentyabr/daily_10-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_11-09.md": {
	id: "sentyabr/daily_11-09.md";
  slug: "sentyabr/daily_11-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_12-09.md": {
	id: "sentyabr/daily_12-09.md";
  slug: "sentyabr/daily_12-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_13-09.md": {
	id: "sentyabr/daily_13-09.md";
  slug: "sentyabr/daily_13-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_14-09.md": {
	id: "sentyabr/daily_14-09.md";
  slug: "sentyabr/daily_14-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_15-09.md": {
	id: "sentyabr/daily_15-09.md";
  slug: "sentyabr/daily_15-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_16-09.md": {
	id: "sentyabr/daily_16-09.md";
  slug: "sentyabr/daily_16-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_17-09.md": {
	id: "sentyabr/daily_17-09.md";
  slug: "sentyabr/daily_17-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_18-09.md": {
	id: "sentyabr/daily_18-09.md";
  slug: "sentyabr/daily_18-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_19-09.md": {
	id: "sentyabr/daily_19-09.md";
  slug: "sentyabr/daily_19-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_20-09.md": {
	id: "sentyabr/daily_20-09.md";
  slug: "sentyabr/daily_20-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_21-09.md": {
	id: "sentyabr/daily_21-09.md";
  slug: "sentyabr/daily_21-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_22-09.md": {
	id: "sentyabr/daily_22-09.md";
  slug: "sentyabr/daily_22-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_23-09.md": {
	id: "sentyabr/daily_23-09.md";
  slug: "sentyabr/daily_23-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_24-09.md": {
	id: "sentyabr/daily_24-09.md";
  slug: "sentyabr/daily_24-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_25-09.md": {
	id: "sentyabr/daily_25-09.md";
  slug: "sentyabr/daily_25-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_26-09.md": {
	id: "sentyabr/daily_26-09.md";
  slug: "sentyabr/daily_26-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_27-09.md": {
	id: "sentyabr/daily_27-09.md";
  slug: "sentyabr/daily_27-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_28-09.md": {
	id: "sentyabr/daily_28-09.md";
  slug: "sentyabr/daily_28-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_29-09.md": {
	id: "sentyabr/daily_29-09.md";
  slug: "sentyabr/daily_29-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"sentyabr/daily_30-09.md": {
	id: "sentyabr/daily_30-09.md";
  slug: "sentyabr/daily_30-09";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_01-01.md": {
	id: "yanvar/daily_01-01.md";
  slug: "yanvar/daily_01-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_02-01.md": {
	id: "yanvar/daily_02-01.md";
  slug: "yanvar/daily_02-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_03-01.md": {
	id: "yanvar/daily_03-01.md";
  slug: "yanvar/daily_03-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_04-01.md": {
	id: "yanvar/daily_04-01.md";
  slug: "yanvar/daily_04-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_05-01.md": {
	id: "yanvar/daily_05-01.md";
  slug: "yanvar/daily_05-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_06-01.md": {
	id: "yanvar/daily_06-01.md";
  slug: "yanvar/daily_06-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_07-01.md": {
	id: "yanvar/daily_07-01.md";
  slug: "yanvar/daily_07-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_08-01.md": {
	id: "yanvar/daily_08-01.md";
  slug: "yanvar/daily_08-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_09-01.md": {
	id: "yanvar/daily_09-01.md";
  slug: "yanvar/daily_09-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_10-01.md": {
	id: "yanvar/daily_10-01.md";
  slug: "yanvar/daily_10-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_11-01.md": {
	id: "yanvar/daily_11-01.md";
  slug: "yanvar/daily_11-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_12-01.md": {
	id: "yanvar/daily_12-01.md";
  slug: "yanvar/daily_12-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_13-01.md": {
	id: "yanvar/daily_13-01.md";
  slug: "yanvar/daily_13-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_14-01.md": {
	id: "yanvar/daily_14-01.md";
  slug: "yanvar/daily_14-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_15-01.md": {
	id: "yanvar/daily_15-01.md";
  slug: "yanvar/daily_15-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_16-01.md": {
	id: "yanvar/daily_16-01.md";
  slug: "yanvar/daily_16-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_17-01.md": {
	id: "yanvar/daily_17-01.md";
  slug: "yanvar/daily_17-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_18-01.md": {
	id: "yanvar/daily_18-01.md";
  slug: "yanvar/daily_18-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_19-01.md": {
	id: "yanvar/daily_19-01.md";
  slug: "yanvar/daily_19-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_20-01.md": {
	id: "yanvar/daily_20-01.md";
  slug: "yanvar/daily_20-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_21-01.md": {
	id: "yanvar/daily_21-01.md";
  slug: "yanvar/daily_21-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_22-01.md": {
	id: "yanvar/daily_22-01.md";
  slug: "yanvar/daily_22-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_23-01.md": {
	id: "yanvar/daily_23-01.md";
  slug: "yanvar/daily_23-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_24-01.md": {
	id: "yanvar/daily_24-01.md";
  slug: "yanvar/daily_24-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_25-01.md": {
	id: "yanvar/daily_25-01.md";
  slug: "yanvar/daily_25-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_26-01.md": {
	id: "yanvar/daily_26-01.md";
  slug: "yanvar/daily_26-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_27-01.md": {
	id: "yanvar/daily_27-01.md";
  slug: "yanvar/daily_27-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_28-01.md": {
	id: "yanvar/daily_28-01.md";
  slug: "yanvar/daily_28-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_29-01.md": {
	id: "yanvar/daily_29-01.md";
  slug: "yanvar/daily_29-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
"yanvar/daily_30-01.md": {
	id: "yanvar/daily_30-01.md";
  slug: "yanvar/daily_30-01";
  body: string;
  collection: "beattiem";
  data: InferEntrySchema<"beattiem">
} & { render(): Render[".md"] };
};
"slt": {
"beskorystnoe-otnoshenie-k-drugim.mdx": {
	id: "beskorystnoe-otnoshenie-k-drugim.mdx";
  slug: "beskorystnoe-otnoshenie-k-drugim";
  body: string;
  collection: "slt";
  data: InferEntrySchema<"slt">
} & { render(): Render[".mdx"] };
"blagodarnost-i-udovletvorenie.mdx": {
	id: "blagodarnost-i-udovletvorenie.mdx";
  slug: "blagodarnost-i-udovletvorenie";
  body: string;
  collection: "slt";
  data: InferEntrySchema<"slt">
} & { render(): Render[".mdx"] };
"lyubov-vo-vsem-mire.mdx": {
	id: "lyubov-vo-vsem-mire.mdx";
  slug: "lyubov-vo-vsem-mire";
  body: string;
  collection: "slt";
  data: InferEntrySchema<"slt">
} & { render(): Render[".mdx"] };
"otkrytost-i-priemlemost.mdx": {
	id: "otkrytost-i-priemlemost.mdx";
  slug: "otkrytost-i-priemlemost";
  body: string;
  collection: "slt";
  data: InferEntrySchema<"slt">
} & { render(): Render[".mdx"] };
"proshchenie-i-miloserdie.mdx": {
	id: "proshchenie-i-miloserdie.mdx";
  slug: "proshchenie-i-miloserdie";
  body: string;
  collection: "slt";
  data: InferEntrySchema<"slt">
} & { render(): Render[".mdx"] };
"vera-v-sebya.mdx": {
	id: "vera-v-sebya.mdx";
  slug: "vera-v-sebya";
  body: string;
  collection: "slt";
  data: InferEntrySchema<"slt">
} & { render(): Render[".mdx"] };
"yasnost-uma.mdx": {
	id: "yasnost-uma.mdx";
  slug: "yasnost-uma";
  body: string;
  collection: "slt";
  data: InferEntrySchema<"slt">
} & { render(): Render[".mdx"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
