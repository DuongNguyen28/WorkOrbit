from bert_score import score

class TranslationEvaluationService:
    async def evaluate_translation(self, original_text: str, translated_text: str, src_lang: str, dest_lang: str) -> dict:
        # Example BERTScore evaluation (for semantic similarity)
        P, R, F1 = score([translated_text], [original_text], lang=dest_lang)  # Use destination language
        bert_score = F1.mean().item()

        # You can include more logic to handle other metrics or methods if necessary

        # Final review score based on BERTScore
        final_score = round(bert_score, 2)

        return {
            "final_review_score": final_score
        }
