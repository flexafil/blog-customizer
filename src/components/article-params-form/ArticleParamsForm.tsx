import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import { ArrowButton } from 'src/ui/arrow-button';
import { Button } from 'src/ui/button';
import { Select } from 'src/ui/select';
import { RadioGroup } from 'src/ui/radio-group';
import { Separator } from 'src/ui/separator';
import { Text } from 'src/ui/text';

import {
	fontFamilyOptions,
	fontColors,
	backgroundColors,
	contentWidthArr,
	fontSizeOptions,
	defaultArticleState,
	type OptionType,
} from 'src/constants/articleProps';

import styles from './ArticleParamsForm.module.scss';

// css переменные
type SettingsVars = {
	'--font-family': string;
	'--font-size': string;
	'--font-color': string;
	'--bg-color': string;
	'--container-width': string;
};

const VAR_KEYS: (keyof SettingsVars)[] = [
	'--font-family',
	'--font-size',
	'--font-color',
	'--bg-color',
	'--container-width',
];

// Читаем начальные значения css переменных из элемента
const readInitialVars = (target: HTMLElement): SettingsVars => {
	const computedStyle = getComputedStyle(target);
	const result = {} as SettingsVars;
	VAR_KEYS.forEach((variableKey) => {
		result[variableKey] = computedStyle.getPropertyValue(variableKey).trim();
	});
	return result;
};

// Применяем css переменные к элементу
const applyCssVars = (target: HTMLElement, vars: Partial<SettingsVars>) => {
	Object.entries(vars).forEach(([variableKey, variableValue]) => {
		if (variableValue != null) {
			target.style.setProperty(variableKey, String(variableValue));
		}
	});
};

// Находим опцию по значению
const findByValue = (options: OptionType[], value: string | null) => {
	return (
		options.find(
			(option) => String(option.value).trim() === String(value).trim()
		) || null
	);
};

export const ArticleParamsForm = () => {
	const [applyTarget, setApplyTarget] = useState<HTMLElement | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const asideRef = useRef<HTMLElement | null>(null);

	const [initialVars, setInitialVars] = useState<SettingsVars | null>(null);
	const [appliedVars, setAppliedVars] = useState<SettingsVars | null>(null);

	const [draft, setDraft] = useState<{
		fontFamily: OptionType | null;
		fontSize: OptionType | null;
		fontColor: OptionType | null;
		backgroundColor: OptionType | null;
		contentWidth: OptionType | null;
	}>({
		fontFamily: defaultArticleState.fontFamilyOption,
		fontSize: defaultArticleState.fontSizeOption,
		fontColor: defaultArticleState.fontColor,
		backgroundColor: defaultArticleState.backgroundColor,
		contentWidth: defaultArticleState.contentWidth,
	});

	// Находим мейн элемент при первом рендере компонента
	useEffect(() => {
		const mainElement = document.querySelector('main');
		if (mainElement) {
			setApplyTarget(mainElement as HTMLElement);
		} else {
			setApplyTarget(document.documentElement);
		}
	}, []);

	// Читаем начальные значения css переменных при загрузке страницы
	useEffect(() => {
		if (!applyTarget) return;

		const initialVariables = readInitialVars(applyTarget);
		setInitialVars(initialVariables);
		setAppliedVars(initialVariables);

		// Синхронизируем форму с реальными значениями переменных
		setDraft((previousDraft) => ({
			fontFamily:
				findByValue(fontFamilyOptions, initialVariables['--font-family']) ??
				previousDraft.fontFamily,
			fontSize:
				findByValue(fontSizeOptions, initialVariables['--font-size']) ??
				previousDraft.fontSize,
			fontColor:
				findByValue(fontColors, initialVariables['--font-color']) ??
				previousDraft.fontColor,
			backgroundColor:
				findByValue(backgroundColors, initialVariables['--bg-color']) ??
				previousDraft.backgroundColor,
			contentWidth:
				findByValue(contentWidthArr, initialVariables['--container-width']) ??
				previousDraft.contentWidth,
		}));
	}, [applyTarget]);

	// При открытии формы показываем текущие примененные значения
	useEffect(() => {
		if (isOpen && appliedVars) {
			setDraft({
				fontFamily: findByValue(
					fontFamilyOptions,
					appliedVars['--font-family']
				),
				fontSize: findByValue(fontSizeOptions, appliedVars['--font-size']),
				fontColor: findByValue(fontColors, appliedVars['--font-color']),
				backgroundColor: findByValue(
					backgroundColors,
					appliedVars['--bg-color']
				),
				contentWidth: findByValue(
					contentWidthArr,
					appliedVars['--container-width']
				),
			});
		}
	}, [isOpen, appliedVars]);

	// Закрыть сайдбар при клике вне его области
	useEffect(() => {
		if (!isOpen) return;
		const handleDocumentClick = (event: MouseEvent) => {
			const asideElement = asideRef.current;
			const clickedElement = event.target as Node;

			if (asideElement && !asideElement.contains(clickedElement)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleDocumentClick);

		return () => {
			document.removeEventListener('mousedown', handleDocumentClick);
		};
	}, [isOpen]);

	// Обработчик нажатия кнопки "Применить"
	const handleApply = (event: React.FormEvent) => {
		if (event) {
			event.preventDefault();
		}

		if (!appliedVars || !applyTarget) return;

		// Создаем новые значения css переменных из формы
		const newVariables: SettingsVars = {
			'--font-family': draft.fontFamily?.value ?? appliedVars['--font-family'],
			'--font-size': draft.fontSize?.value ?? appliedVars['--font-size'],
			'--font-color': draft.fontColor?.value ?? appliedVars['--font-color'],
			'--bg-color': draft.backgroundColor?.value ?? appliedVars['--bg-color'],
			'--container-width':
				draft.contentWidth?.value ?? appliedVars['--container-width'],
		};

		// и применяем их
		setAppliedVars(newVariables);
		applyCssVars(applyTarget, newVariables);
		setIsOpen(false);
	};

	// Обработчик нажатия кнопки "Сбросить"
	const handleReset = (event?: React.FormEvent) => {
		if (event) {
			event.preventDefault();
		}

		if (!initialVars || !applyTarget) return;
		setDraft({
			fontFamily: findByValue(fontFamilyOptions, initialVars['--font-family']),
			fontSize: findByValue(fontSizeOptions, initialVars['--font-size']),
			fontColor: findByValue(fontColors, initialVars['--font-color']),
			backgroundColor: findByValue(backgroundColors, initialVars['--bg-color']),
			contentWidth: findByValue(
				contentWidthArr,
				initialVars['--container-width']
			),
		});

		// Применяем начальные значения
		setAppliedVars(initialVars);
		applyCssVars(applyTarget, initialVars);
		setIsOpen(false);
	};

	return (
		<>
			<ArrowButton
				isOpen={isOpen}
				onClick={() => setIsOpen((previousValue) => !previousValue)}
			/>

			<aside
				ref={asideRef}
				className={clsx(styles.container, { [styles.container_open]: isOpen })}
				role='dialog'
				aria-modal='true'
				aria-hidden={!isOpen}>
				<form
					className={styles.form}
					onSubmit={handleApply}
					onReset={handleReset}>
					<Text as='h2' weight={800} size={31} uppercase>
						Задайте параметры
					</Text>

					<Select
						title='Шрифт'
						placeholder='Выберите шрифт'
						options={fontFamilyOptions}
						selected={draft.fontFamily}
						onChange={(selectedOption) => {
							setDraft((previousDraft) => ({
								...previousDraft,
								fontFamily: selectedOption,
							}));
						}}
						onClose={() => {}}
					/>

					<RadioGroup
						title='Размер шрифта'
						name='font-size'
						options={fontSizeOptions}
						selected={draft.fontSize!}
						onChange={(selectedOption) => {
							setDraft((previousDraft) => ({
								...previousDraft,
								fontSize: selectedOption,
							}));
						}}
					/>

					<Select
						title='Цвет шрифта'
						placeholder='Выберите цвет'
						options={fontColors}
						selected={draft.fontColor}
						onChange={(selectedOption) => {
							setDraft((previousDraft) => ({
								...previousDraft,
								fontColor: selectedOption,
							}));
						}}
						onClose={() => {}}
					/>

					<Separator />

					<Select
						title='Цвет фона'
						placeholder='Выберите фон'
						options={backgroundColors}
						selected={draft.backgroundColor}
						onChange={(selectedOption) => {
							setDraft((previousDraft) => ({
								...previousDraft,
								backgroundColor: selectedOption,
							}));
						}}
						onClose={() => {}}
					/>

					<Select
						title='Ширина контента'
						placeholder='Выберите ширину'
						options={contentWidthArr}
						selected={draft.contentWidth}
						onChange={(selectedOption) => {
							setDraft((previousDraft) => ({
								...previousDraft,
								contentWidth: selectedOption,
							}));
						}}
						onClose={() => {}}
					/>

					<div className={styles.bottomContainer}>
						<Button title='Сбросить' htmlType='reset' type='clear' />
						<Button title='Применить' htmlType='submit' type='apply' />
					</div>
				</form>
			</aside>
		</>
	);
};
